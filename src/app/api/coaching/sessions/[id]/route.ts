/**
 * コーチングセッション詳細API
 * GET: セッション詳細取得（メッセージ含む）
 * PATCH: セッション更新（ステップ更新、完了など）
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, coachingSessions, coachingMessages } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ========================================
// Validation
// ========================================

const updateSessionSchema = z.object({
  currentStep: z.number().int().min(1).max(9).optional(),
  status: z.enum(["active", "completed", "abandoned"]).optional(),
  summary: z.string().max(2000).optional(),
});

// ========================================
// Types
// ========================================

type MessageResponse = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  step: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type SessionDetailResponse = {
  id: string;
  title: string;
  sessionType: string;
  status: string;
  currentStep: number;
  context: Record<string, unknown> | null;
  summary: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: MessageResponse[];
};

// ========================================
// Helper Functions
// ========================================

async function getSession() {
  const auth = getAuth();
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

function parseJSON(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getDefaultTitle(sessionType: string): string {
  const titles: Record<string, string> = {
    onboarding: "オンボーディング",
    free: "コーチングセッション",
    daily_checkin: "デイリーチェックイン",
    weekly_review: "週次振り返り",
    habit_review: "習慣振り返り",
    celebration: "称賛セッション",
  };
  return titles[sessionType] || "セッション";
}

function formatMessageResponse(
  message: typeof coachingMessages.$inferSelect
): MessageResponse {
  return {
    id: message.id,
    sessionId: message.sessionId,
    role: message.role,
    content: message.content,
    step: message.step,
    metadata: parseJSON(message.metadata),
    createdAt: message.createdAt,
  };
}

function formatSessionDetail(
  session: typeof coachingSessions.$inferSelect,
  messages: (typeof coachingMessages.$inferSelect)[]
): SessionDetailResponse {
  const ctx = parseJSON(session.context);
  return {
    id: session.id,
    title: (ctx?.title as string) || getDefaultTitle(session.sessionType),
    sessionType: session.sessionType,
    status: session.status,
    currentStep: session.currentStep ?? 1,
    context: ctx,
    summary: session.summary,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messages: messages.map(formatMessageResponse),
  };
}

// ========================================
// GET: セッション詳細取得
// ========================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: sessionId } = await params;
    const db = getDb();

    const coachingSession = await db.query.coachingSessions.findFirst({
      where: and(
        eq(coachingSessions.id, sessionId),
        eq(coachingSessions.userId, session.user.id)
      ),
    });

    if (!coachingSession) {
      return NextResponse.json(
        { error: "Not Found", message: "Session not found" },
        { status: 404 }
      );
    }

    const messages = await db.query.coachingMessages.findMany({
      where: eq(coachingMessages.sessionId, sessionId),
      orderBy: [coachingMessages.createdAt],
    });

    return NextResponse.json({
      success: true,
      data: formatSessionDetail(coachingSession, messages),
    });
  } catch (error) {
    console.error("GET /api/coaching/sessions/[id] error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch session",
      },
      { status: 500 }
    );
  }
}

// ========================================
// PATCH: セッション更新
// ========================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: sessionId } = await params;

    const body = await request.json();
    const validationResult = updateSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid request body",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const db = getDb();

    // セッションの存在確認とユーザー確認
    const coachingSession = await db.query.coachingSessions.findFirst({
      where: and(
        eq(coachingSessions.id, sessionId),
        eq(coachingSessions.userId, session.user.id)
      ),
    });

    if (!coachingSession) {
      return NextResponse.json(
        { error: "Not Found", message: "Session not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    const data = validationResult.data;

    if (data.currentStep !== undefined) {
      updateData.currentStep = data.currentStep;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "completed") {
        updateData.completedAt = new Date().toISOString();
      }
    }

    if (data.summary !== undefined) {
      updateData.summary = data.summary;
    }

    await db
      .update(coachingSessions)
      .set(updateData)
      .where(eq(coachingSessions.id, sessionId));

    // 更新後のセッションを取得
    const updatedSession = await db.query.coachingSessions.findFirst({
      where: eq(coachingSessions.id, sessionId),
    });

    if (!updatedSession) {
      return NextResponse.json(
        {
          error: "Internal Server Error",
          message: "Failed to fetch updated session",
        },
        { status: 500 }
      );
    }

    const messages = await db.query.coachingMessages.findMany({
      where: eq(coachingMessages.sessionId, sessionId),
      orderBy: [coachingMessages.createdAt],
    });

    return NextResponse.json({
      success: true,
      data: formatSessionDetail(updatedSession, messages),
    });
  } catch (error) {
    console.error("PATCH /api/coaching/sessions/[id] error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to update session",
      },
      { status: 500 }
    );
  }
}
