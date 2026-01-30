/**
 * セッションサマリー生成API
 * POST: AIによるサマリー生成（キャッシュ付き）
 */

import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, coachingSessions, coachingMessages } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { generateSessionSummary } from "@/lib/ai/summary";

export const dynamic = "force-dynamic";

async function getSession() {
  const auth = getAuth();
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

// ========================================
// POST: サマリー生成（キャッシュ付き）
// ========================================

export async function POST(
  _request: Request,
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

    // セッション取得＋所有者確認
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

    // キャッシュチェック: summaryが既にJSON形式で保存されている場合はそのまま返す
    if (coachingSession.summary) {
      try {
        const cached = JSON.parse(coachingSession.summary);
        // 構造化サマリーかどうかを判定（habitSuggestionフィールドの有無）
        if (cached && typeof cached === "object" && "habitSuggestion" in cached) {
          return NextResponse.json({ success: true, data: cached });
        }
      } catch {
        // JSON parseに失敗 = 旧形式のテキストサマリー → 再生成
      }
    }

    // 全メッセージ取得
    const messages = await db.query.coachingMessages.findMany({
      where: eq(coachingMessages.sessionId, sessionId),
      orderBy: [coachingMessages.createdAt],
    });

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Bad Request", message: "No messages in session" },
        { status: 400 }
      );
    }

    // AIサマリー生成
    const summaryData = await generateSessionSummary(
      messages.map((m) => ({ role: m.role, content: m.content }))
    );

    // 結果をDBにキャッシュ
    await db
      .update(coachingSessions)
      .set({
        summary: JSON.stringify(summaryData),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(coachingSessions.id, sessionId));

    return NextResponse.json({ success: true, data: summaryData });
  } catch (error) {
    console.error("POST /api/coaching/sessions/[id]/summary error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to generate summary",
      },
      { status: 500 }
    );
  }
}
