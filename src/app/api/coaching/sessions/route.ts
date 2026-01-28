/**
 * コーチングセッション管理API
 * GET: セッション一覧取得
 * POST: 新規セッション作成
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, coachingSessions } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ========================================
// Validation
// ========================================

const createSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  purpose: z
    .enum([
      "performance",
      "mental",
      "transformation",
      "free",
      "daily_checkin",
      "weekly_review",
    ])
    .optional()
    .default("free"),
  sessionType: z
    .enum([
      "onboarding",
      "free",
      "daily_checkin",
      "weekly_review",
      "habit_review",
      "celebration",
    ])
    .optional()
    .default("free"),
});

// ========================================
// Types
// ========================================

type SessionResponse = {
  id: string;
  title: string;
  sessionType: string;
  status: string;
  currentStep: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

function parseContext(context: string | null): Record<string, unknown> | null {
  if (!context) return null;
  try {
    return JSON.parse(context);
  } catch {
    return null;
  }
}

function formatSessionResponse(
  session: typeof coachingSessions.$inferSelect
): SessionResponse {
  const ctx = parseContext(session.context);
  return {
    id: session.id,
    title:
      (ctx?.title as string) ||
      getDefaultTitle(session.sessionType),
    sessionType: session.sessionType,
    status: session.status,
    currentStep: session.currentStep ?? 1,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
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

// ========================================
// GET: セッション一覧取得
// ========================================

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getDb();

    // クエリパラメータからフィルタ取得
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100
    );

    let whereClause;
    if (status) {
      whereClause = and(
        eq(coachingSessions.userId, session.user.id),
        eq(coachingSessions.status, status)
      );
    } else {
      whereClause = eq(coachingSessions.userId, session.user.id);
    }

    const sessions = await db.query.coachingSessions.findMany({
      where: whereClause,
      orderBy: [desc(coachingSessions.createdAt)],
      limit,
    });

    return NextResponse.json({
      success: true,
      data: sessions.map(formatSessionResponse),
    });
  } catch (error) {
    console.error("GET /api/coaching/sessions error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch sessions",
      },
      { status: 500 }
    );
  }
}

// ========================================
// POST: 新規セッション作成
// ========================================

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = createSessionSchema.safeParse(body);

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

    const { title, sessionType } = validationResult.data;

    const db = getDb();
    const now = new Date().toISOString();

    const contextData: Record<string, unknown> = {};
    if (title) {
      contextData.title = title;
    }
    if (validationResult.data.purpose) {
      contextData.purpose = validationResult.data.purpose;
    }

    const newSession = {
      id: nanoid(),
      userId: session.user.id,
      sessionType,
      status: "active",
      currentStep: 1,
      context:
        Object.keys(contextData).length > 0
          ? JSON.stringify(contextData)
          : null,
      summary: null,
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(coachingSessions).values(newSession);

    return NextResponse.json(
      {
        success: true,
        data: formatSessionResponse(newSession),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/coaching/sessions error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to create session",
      },
      { status: 500 }
    );
  }
}
