"use server";

import { getAuth } from "@/lib/auth";
import { getDb, coachingSessions, coachingMessages } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import type { SessionType } from "@/types/ai";

// ========================================
// Types
// ========================================

export type CoachingSessionData = {
  id: string;
  userId: string;
  sessionType: string;
  status: string;
  currentStep: number;
  context: Record<string, unknown> | null;
  summary: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CoachingMessageData = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  step: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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

function formatSession(
  session: typeof coachingSessions.$inferSelect
): CoachingSessionData {
  return {
    id: session.id,
    userId: session.userId,
    sessionType: session.sessionType,
    status: session.status,
    currentStep: session.currentStep ?? 1,
    context: parseJSON(session.context),
    summary: session.summary,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

function formatMessage(
  message: typeof coachingMessages.$inferSelect
): CoachingMessageData {
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

// ========================================
// Server Actions
// ========================================

/**
 * 新規コーチングセッションを作成
 */
export async function createCoachingSession(params: {
  title?: string;
  sessionType: SessionType;
}): Promise<ActionResult<CoachingSessionData>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();
    const now = new Date().toISOString();
    const newSession = {
      id: nanoid(),
      userId: session.user.id,
      sessionType: params.sessionType,
      status: "active",
      currentStep: 1,
      context: params.title ? JSON.stringify({ title: params.title }) : null,
      summary: null,
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(coachingSessions).values(newSession);

    return {
      success: true,
      data: formatSession(newSession),
    };
  } catch (error) {
    console.error("createCoachingSession error:", error);
    return { success: false, error: "Failed to create session" };
  }
}

/**
 * セッション詳細を取得
 */
export async function getCoachingSession(
  sessionId: string
): Promise<ActionResult<CoachingSessionData & { messages: CoachingMessageData[] }>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    const coachingSession = await db.query.coachingSessions.findFirst({
      where: and(
        eq(coachingSessions.id, sessionId),
        eq(coachingSessions.userId, session.user.id)
      ),
    });

    if (!coachingSession) {
      return { success: false, error: "Session not found" };
    }

    const messages = await db.query.coachingMessages.findMany({
      where: eq(coachingMessages.sessionId, sessionId),
      orderBy: [coachingMessages.createdAt],
    });

    return {
      success: true,
      data: {
        ...formatSession(coachingSession),
        messages: messages.map(formatMessage),
      },
    };
  } catch (error) {
    console.error("getCoachingSession error:", error);
    return { success: false, error: "Failed to fetch session" };
  }
}

/**
 * セッション一覧を取得
 */
export async function getCoachingSessions(params?: {
  status?: string;
  limit?: number;
}): Promise<ActionResult<CoachingSessionData[]>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();
    const limit = params?.limit ?? 20;

    let whereClause;
    if (params?.status) {
      whereClause = and(
        eq(coachingSessions.userId, session.user.id),
        eq(coachingSessions.status, params.status)
      );
    } else {
      whereClause = eq(coachingSessions.userId, session.user.id);
    }

    const sessions = await db.query.coachingSessions.findMany({
      where: whereClause,
      orderBy: [desc(coachingSessions.createdAt)],
      limit,
    });

    return {
      success: true,
      data: sessions.map(formatSession),
    };
  } catch (error) {
    console.error("getCoachingSessions error:", error);
    return { success: false, error: "Failed to fetch sessions" };
  }
}

/**
 * セッションのステップを更新
 */
export async function updateSessionStep(
  sessionId: string,
  step: number
): Promise<ActionResult<CoachingSessionData>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
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
      return { success: false, error: "Session not found" };
    }

    if (coachingSession.status !== "active") {
      return { success: false, error: "Session is not active" };
    }

    const now = new Date().toISOString();
    await db
      .update(coachingSessions)
      .set({
        currentStep: step,
        updatedAt: now,
      })
      .where(eq(coachingSessions.id, sessionId));

    const updatedSession = await db.query.coachingSessions.findFirst({
      where: eq(coachingSessions.id, sessionId),
    });

    if (!updatedSession) {
      return { success: false, error: "Failed to fetch updated session" };
    }

    return {
      success: true,
      data: formatSession(updatedSession),
    };
  } catch (error) {
    console.error("updateSessionStep error:", error);
    return { success: false, error: "Failed to update session step" };
  }
}

/**
 * セッションを完了
 */
export async function completeCoachingSession(
  sessionId: string,
  summary?: string
): Promise<ActionResult<CoachingSessionData>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
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
      return { success: false, error: "Session not found" };
    }

    if (coachingSession.status === "completed") {
      return { success: true, data: formatSession(coachingSession) };
    }

    const now = new Date().toISOString();
    await db
      .update(coachingSessions)
      .set({
        status: "completed",
        summary: summary ?? null,
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(coachingSessions.id, sessionId));

    const updatedSession = await db.query.coachingSessions.findFirst({
      where: eq(coachingSessions.id, sessionId),
    });

    if (!updatedSession) {
      return { success: false, error: "Failed to fetch updated session" };
    }

    return {
      success: true,
      data: formatSession(updatedSession),
    };
  } catch (error) {
    console.error("completeCoachingSession error:", error);
    return { success: false, error: "Failed to complete session" };
  }
}

/**
 * セッションにメッセージを保存
 */
export async function saveCoachingMessage(params: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  step?: number;
  metadata?: Record<string, unknown>;
}): Promise<ActionResult<CoachingMessageData>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    // セッションの存在確認とユーザー確認
    const coachingSession = await db.query.coachingSessions.findFirst({
      where: and(
        eq(coachingSessions.id, params.sessionId),
        eq(coachingSessions.userId, session.user.id)
      ),
    });

    if (!coachingSession) {
      return { success: false, error: "Session not found" };
    }

    const now = new Date().toISOString();
    const newMessage = {
      id: nanoid(),
      sessionId: params.sessionId,
      role: params.role,
      content: params.content,
      step: params.step ?? null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      createdAt: now,
    };

    await db.insert(coachingMessages).values(newMessage);

    return {
      success: true,
      data: formatMessage(newMessage),
    };
  } catch (error) {
    console.error("saveCoachingMessage error:", error);
    return { success: false, error: "Failed to save message" };
  }
}
