/**
 * AI設定ファイル
 * Claude APIの設定とモデル選択
 */

import type { CoachTone, SessionType } from "@/types/ai";

/**
 * 利用可能なClaudeモデル
 */
export const CLAUDE_MODELS = {
  // 高性能モデル（複雑な対話向け）
  SONNET: "claude-sonnet-4-20250514",
  // 高速モデル（デイリーチェックイン向け）
  HAIKU: "claude-3-5-haiku-20241022",
} as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];

/**
 * セッション種別ごとのモデル設定
 */
export const SESSION_MODEL_CONFIG: Record<SessionType, ClaudeModel> = {
  onboarding: CLAUDE_MODELS.SONNET, // 価値観抽出には高性能モデル
  free: CLAUDE_MODELS.SONNET, // 自由対話には高性能モデル
  daily_checkin: CLAUDE_MODELS.HAIKU, // 簡単なチェックインは高速モデル
  weekly_review: CLAUDE_MODELS.SONNET, // 振り返りには高性能モデル
  habit_review: CLAUDE_MODELS.HAIKU, // 習慣確認は高速モデル
  celebration: CLAUDE_MODELS.HAIKU, // お祝いは高速モデル
};

/**
 * トークン制限設定
 */
export const TOKEN_LIMITS = {
  // 入力トークンの最大値
  MAX_INPUT_TOKENS: 4096,
  // 出力トークンの最大値（セッション種別ごと）
  MAX_OUTPUT_TOKENS: {
    onboarding: 1024,
    free: 1024,
    daily_checkin: 512,
    weekly_review: 1024,
    habit_review: 512,
    celebration: 512,
  } as Record<SessionType, number>,
  // 会話履歴の最大メッセージ数
  MAX_CONVERSATION_HISTORY: 20,
  // 会話履歴の最大トークン数（概算）
  MAX_HISTORY_TOKENS: 3000,
} as const;

/**
 * API設定
 */
export const API_CONFIG = {
  // タイムアウト（ミリ秒）
  TIMEOUT_MS: 30000,
  // リトライ回数
  MAX_RETRIES: 3,
  // リトライ間隔（ミリ秒）
  RETRY_DELAY_MS: 1000,
  // ストリーミングのチャンクサイズ
  STREAM_CHUNK_SIZE: 100,
} as const;

/**
 * レート制限設定
 */
export const RATE_LIMIT_CONFIG = {
  // 1分あたりの最大リクエスト数
  REQUESTS_PER_MINUTE: 20,
  // 1日あたりの最大セッション数
  SESSIONS_PER_DAY: 50,
  // 同時接続数
  MAX_CONCURRENT_REQUESTS: 3,
} as const;

/**
 * モデルパラメータ設定
 */
export interface ModelParameters {
  temperature: number;
  topP: number;
  topK: number;
}

/**
 * セッション種別ごとのモデルパラメータ
 */
export const SESSION_PARAMETERS: Record<SessionType, ModelParameters> = {
  onboarding: {
    temperature: 0.7, // 創造的な質問生成
    topP: 0.9,
    topK: 40,
  },
  free: {
    temperature: 0.8, // 柔軟な対話
    topP: 0.95,
    topK: 50,
  },
  daily_checkin: {
    temperature: 0.6, // 一貫した応答
    topP: 0.85,
    topK: 30,
  },
  weekly_review: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
  },
  habit_review: {
    temperature: 0.5, // より確実な応答
    topP: 0.8,
    topK: 25,
  },
  celebration: {
    temperature: 0.8, // 温かみのある応答
    topP: 0.95,
    topK: 50,
  },
};

/**
 * コーチトーンごとの追加パラメータ調整
 */
export const TONE_PARAMETER_ADJUSTMENTS: Record<
  CoachTone,
  Partial<ModelParameters>
> = {
  gentle: {
    temperature: 0.05, // 少し温かみを増す
  },
  friendly: {
    temperature: 0.1, // よりカジュアルに
  },
  business: {
    temperature: -0.1, // より一貫性を重視
  },
};

/**
 * AI設定を取得
 */
export function getAIConfig(sessionType: SessionType, tone?: CoachTone) {
  const model = SESSION_MODEL_CONFIG[sessionType];
  const baseParams = SESSION_PARAMETERS[sessionType];
  const maxOutputTokens = TOKEN_LIMITS.MAX_OUTPUT_TOKENS[sessionType];

  // トーンによるパラメータ調整
  let adjustedParams = { ...baseParams };
  if (tone) {
    const adjustment = TONE_PARAMETER_ADJUSTMENTS[tone];
    adjustedParams = {
      ...adjustedParams,
      temperature: Math.max(
        0,
        Math.min(1, baseParams.temperature + (adjustment.temperature || 0))
      ),
    };
  }

  return {
    model,
    maxOutputTokens,
    parameters: adjustedParams,
    timeout: API_CONFIG.TIMEOUT_MS,
    maxRetries: API_CONFIG.MAX_RETRIES,
  };
}

/**
 * 環境変数からAPI設定を取得
 */
export function getAPICredentials() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set in environment variables"
    );
  }

  return {
    apiKey,
    baseUrl: process.env.ANTHROPIC_API_BASE_URL || "https://api.anthropic.com",
  };
}

/**
 * 会話履歴のトークン数を概算
 */
export function estimateTokenCount(text: string): number {
  // 日本語は1文字あたり約1.5トークン、英語は約0.25トークン
  // 簡易的な計算として、文字数 * 0.7 で概算
  return Math.ceil(text.length * 0.7);
}

/**
 * 会話履歴をトークン制限内に収める
 */
export function trimConversationHistory(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number = TOKEN_LIMITS.MAX_HISTORY_TOKENS
): Array<{ role: string; content: string }> {
  let totalTokens = 0;
  const result: Array<{ role: string; content: string }> = [];

  // 最新のメッセージから逆順に追加
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokenCount(message.content);

    if (totalTokens + messageTokens > maxTokens) {
      break;
    }

    result.unshift(message);
    totalTokens += messageTokens;
  }

  return result;
}

/**
 * ストリーミング設定
 */
export const STREAMING_CONFIG = {
  // ストリーミングを有効にするかどうか
  ENABLED: true,
  // チャンク送信の最小間隔（ミリ秒）
  MIN_CHUNK_INTERVAL_MS: 50,
  // ハートビート間隔（ミリ秒）
  HEARTBEAT_INTERVAL_MS: 15000,
} as const;

/**
 * エラーメッセージ
 */
export const AI_ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: "リクエスト制限に達しました。しばらくお待ちください。",
  API_ERROR: "AIとの通信中にエラーが発生しました。再度お試しください。",
  TIMEOUT: "応答に時間がかかっています。もう一度お試しください。",
  INVALID_SESSION: "セッションが無効です。新しいセッションを開始してください。",
  CONTENT_FILTER: "申し訳ありませんが、その内容にはお答えできません。",
} as const;
