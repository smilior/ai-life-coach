/**
 * AIコーチング チャットAPI
 * POST: ストリーミングレスポンスで応答
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, coachingSessions, coachingMessages, userProfiles } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  generateCoachingResponse,
  isAIAvailable,
  shouldAdvanceStep,
} from "@/lib/ai/chat";
import { AI_ERROR_MESSAGES } from "@/lib/ai/config";
import type { CoachingStep, SessionType } from "@/types/ai";

export const dynamic = "force-dynamic";

// ========================================
// Validation
// ========================================

const chatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(5000),
  step: z.number().int().min(1).max(9).optional(),
});

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

// ========================================
// POST: ストリーミング チャット応答
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

    // リクエストボディのバリデーション
    const body = await request.json();
    const validationResult = chatRequestSchema.safeParse(body);

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

    const { sessionId, message, step } = validationResult.data;

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
        { error: "Not Found", message: AI_ERROR_MESSAGES.INVALID_SESSION },
        { status: 404 }
      );
    }

    if (coachingSession.status !== "active") {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Session is not active. Please start a new session.",
        },
        { status: 400 }
      );
    }

    // 現在のステップ
    const currentStep = (step ?? coachingSession.currentStep ?? 1) as CoachingStep;

    // 会話履歴を取得
    const existingMessages = await db.query.coachingMessages.findMany({
      where: eq(coachingMessages.sessionId, sessionId),
      orderBy: [coachingMessages.createdAt],
    });

    const conversationHistory = existingMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // ユーザーメッセージを保存
    const now = new Date().toISOString();
    await db.insert(coachingMessages).values({
      id: nanoid(),
      sessionId,
      role: "user",
      content: message,
      step: currentStep,
      metadata: null,
      createdAt: now,
    });

    // ユーザープロフィールを取得
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    const userProfile = profile
      ? {
          nickname: profile.nickname || session.user.name || "ユーザー",
          purpose: (profile.purpose as "performance" | "mental" | "change") || "performance",
          values: profile.values ? JSON.parse(profile.values) : [],
          goals: [],
          motivation: profile.motivation || "",
          strengths: [],
          tone: "gentle" as const,
        }
      : undefined;

    // AI応答を生成
    const { stream, mockResponse } = await generateCoachingResponse({
      sessionId,
      sessionType: coachingSession.sessionType as SessionType,
      currentStep,
      message,
      conversationHistory,
      userProfile,
      userId: session.user.id,
    });

    // ステップの進行を判定
    // +2: 現在のユーザーメッセージ + これから生成されるアシスタント応答
    // existingMessages は常に偶数（user+assistant ペア）なので、+1 だと常に奇数になり
    // messageCount % 4 === 0 が絶対に成立しないバグがあった
    const totalMessages = existingMessages.length + 2;
    const nextStep = shouldAdvanceStep(
      currentStep,
      totalMessages,
      coachingSession.sessionType as SessionType
    );

    // セッション終了判定: ステップ9到達後、4メッセージ（2往復）ごとに完了トリガー
    const shouldEndSession =
      currentStep >= 9 && totalMessages > 0 && totalMessages % 4 === 0;

    // ステップが進んだ場合はDB更新
    if (nextStep !== currentStep) {
      await db
        .update(coachingSessions)
        .set({
          currentStep: nextStep,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(coachingSessions.id, sessionId));
    }

    // モック応答（API Key未設定時）
    if (mockResponse) {
      // モック応答をDBに保存
      await db.insert(coachingMessages).values({
        id: nanoid(),
        sessionId,
        role: "assistant",
        content: mockResponse,
        step: currentStep,
        metadata: JSON.stringify({ mock: true }),
        createdAt: new Date().toISOString(),
      });

      // セッション終了時はDBステータスを更新
      if (shouldEndSession) {
        await db
          .update(coachingSessions)
          .set({
            status: "completed",
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(coachingSessions.id, sessionId));
      }

      return NextResponse.json({
        message: mockResponse,
        step: nextStep,
        mock: true,
        shouldEndSession,
      });
    }

    // ストリーミング応答
    if (stream) {
      // アシスタント応答をストリーム完了後に保存するためのコールバック
      const result = stream;

      // Vercel AI SDK の toTextStreamResponse を使用
      const response = result.toTextStreamResponse();

      // ステップ進行情報をヘッダーで通知
      response.headers.set("X-Next-Step", String(nextStep));

      // セッション終了時はヘッダーを付与
      if (shouldEndSession) {
        response.headers.set("X-Session-End", "true");
      }

      // ストリーム完了後にメッセージを保存（バックグラウンド処理）
      result.text.then(async (fullText) => {
        try {
          const db = getDb();
          await db.insert(coachingMessages).values({
            id: nanoid(),
            sessionId,
            role: "assistant",
            content: fullText,
            step: currentStep,
            metadata: JSON.stringify({ streamed: true }),
            createdAt: new Date().toISOString(),
          });

          // セッション終了時はDBステータスを更新
          if (shouldEndSession) {
            await db
              .update(coachingSessions)
              .set({
                status: "completed",
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .where(eq(coachingSessions.id, sessionId));
          }
        } catch (err) {
          console.error("Failed to save assistant message:", err);
        }
      });

      return response;
    }

    // fallback
    return NextResponse.json(
      { error: "Internal Server Error", message: AI_ERROR_MESSAGES.API_ERROR },
      { status: 500 }
    );
  } catch (error) {
    console.error("POST /api/coaching/chat error:", error);

    // レート制限エラーのハンドリング
    if (
      error instanceof Error &&
      error.message === AI_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
    ) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: AI_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: AI_ERROR_MESSAGES.API_ERROR },
      { status: 500 }
    );
  }
}
