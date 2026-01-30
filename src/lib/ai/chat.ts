/**
 * AI対話ヘルパー
 * OpenAI APIを使用したコーチング応答生成
 */

import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { CoachingStep, SessionContext, SessionType } from "@/types/ai";
import { generateSystemPrompt } from "./prompts";
import {
  getAIConfig,
  trimConversationHistory,
  TOKEN_LIMITS,
  RATE_LIMIT_CONFIG,
  AI_ERROR_MESSAGES,
} from "./config";

// ============================================================================
// OpenAI Provider
// ============================================================================

/**
 * OpenAIプロバイダーを取得（環境変数チェック付き）
 */
export function getOpenAIProvider() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return createOpenAI({
    apiKey,
  });
}

/**
 * API Keyが利用可能かどうかチェック
 */
export function isAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// ============================================================================
// Rate Limiting (インメモリ簡易実装)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * レート制限チェック
 * @returns true if rate limited (blocked)
 */
export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const key = `rate:${userId}`;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + 60 * 1000, // 1分後にリセット
    });
    return false;
  }

  if (entry.count >= RATE_LIMIT_CONFIG.REQUESTS_PER_MINUTE) {
    return true;
  }

  entry.count++;
  return false;
}

// ============================================================================
// Mock Response (API Key未設定時のフォールバック)
// ============================================================================

/**
 * モック応答を生成（開発用）
 */
function generateMockResponse(
  message: string,
  step: CoachingStep
): string {
  const mockResponses: Record<number, string> = {
    1: `お話を聞かせていただきありがとうございます。「${message.slice(0, 20)}...」と感じていらっしゃるんですね。その気持ちはとても自然なことだと思います。もう少し詳しく聞かせていただけますか？`,
    2: "なるほど、別の角度から見ると、それはあなたの成長意欲の表れかもしれませんね。この経験から得られた気づきはありますか？",
    3: "理想の状態が実現したら、どんな気持ちになりそうですか？具体的にイメージしてみてください。",
    4: "10点を理想の状態として、今は何点くらいだと感じますか？その点数をつけた理由も教えていただけると嬉しいです。",
    5: "ここまでお話を聞いていて、あなたには素晴らしい強みがあると感じています。自分で気づいている強みはありますか？",
    6: "最近、少しでもうまくいった時のことを教えてください。その時はどんな状況でしたか？",
    7: "お話を聞いていて、あなたの粘り強さと前向きな姿勢が印象的です。これは大きな強みですね。",
    8: "いくつかの選択肢がありそうですね。\n1. 小さな一歩から始める\n2. 環境を変えてみる\n3. 誰かに相談する\nどれが一番しっくりきますか？",
    9: "では、最初の2分でできる小さな一歩を決めましょう。今日中にできる、本当に小さなアクションは何でしょうか？",
  };

  return (
    mockResponses[step] ||
    "お話を聞かせていただきありがとうございます。もう少し詳しく教えていただけますか？"
  );
}

// ============================================================================
// コーチング応答生成
// ============================================================================

/**
 * セッション履歴からコンテキストを構築
 */
export function buildSessionContext(params: {
  sessionId: string;
  sessionType: SessionType;
  currentStep: CoachingStep;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  userProfile?: SessionContext["userProfile"];
}): SessionContext {
  const { sessionId, sessionType, currentStep, messages, userProfile } = params;

  return {
    sessionId,
    sessionType,
    currentStep,
    questionCount: messages.filter((m) => m.role === "assistant").length,
    userProfile: userProfile || {
      nickname: "ユーザー",
      purpose: "performance",
      values: [],
      goals: [],
      motivation: "",
      strengths: [],
      tone: "gentle",
    },
    conversationHistory: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    extractedInsights: [],
    suggestedActions: [],
  };
}

/**
 * ストリーミングコーチング応答を生成
 */
export async function generateCoachingResponse(params: {
  sessionId: string;
  sessionType: SessionType;
  currentStep: CoachingStep;
  message: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  userProfile?: SessionContext["userProfile"];
  userId: string;
}) {
  const {
    sessionId,
    sessionType,
    currentStep,
    message,
    conversationHistory,
    userProfile,
    userId,
  } = params;

  // レート制限チェック
  if (checkRateLimit(userId)) {
    throw new Error(AI_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
  }

  // セッションコンテキスト構築
  const context = buildSessionContext({
    sessionId,
    sessionType,
    currentStep,
    messages: conversationHistory,
    userProfile,
  });

  // システムプロンプト生成
  const systemPrompt = generateSystemPrompt(context);

  // 会話履歴をトークン制限内にトリミング
  const trimmedHistory = trimConversationHistory(
    conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    TOKEN_LIMITS.MAX_HISTORY_TOKENS
  );

  // メッセージ配列を構築
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...trimmedHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  // OpenAIプロバイダー取得
  const openai = getOpenAIProvider();

  // API Key未設定時はモック応答
  if (!openai) {
    const mockText = generateMockResponse(message, currentStep);
    return {
      stream: null,
      mockResponse: mockText,
    };
  }

  // AI設定取得
  const aiConfig = getAIConfig(
    sessionType,
    userProfile?.tone
  );

  // ストリーミング応答生成
  const result = streamText({
    model: openai(aiConfig.model),
    system: systemPrompt,
    messages,
    maxOutputTokens: aiConfig.maxOutputTokens,
    temperature: aiConfig.parameters.temperature,
    topP: aiConfig.parameters.topP,
    providerOptions: {
      openai: {
        reasoningEffort: aiConfig.parameters.reasoningEffort,
      },
    },
  });

  return {
    stream: result,
    mockResponse: null,
  };
}

/**
 * 現在のステップに応じたプロンプト切り替え
 * ステップの進行を判定する
 */
export function shouldAdvanceStep(
  currentStep: CoachingStep,
  messageCount: number,
  sessionType: SessionType
): CoachingStep {
  // フリーセッション以外はステップ進行なし
  if (sessionType !== "free") {
    return currentStep;
  }

  // 基本的に2メッセージ（1往復）ごとにステップを進める
  // ただしステップ1（感情の受容）は十分に行う
  if (currentStep === 1 && messageCount < 4) {
    return 1;
  }

  // 最大ステップは9
  if (currentStep >= 9) {
    return 9;
  }

  // 2往復（4メッセージ）ごとに次のステップへ
  if (messageCount > 0 && messageCount % 4 === 0) {
    return (currentStep + 1) as CoachingStep;
  }

  return currentStep;
}
