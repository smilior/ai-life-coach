/**
 * AIコーチング関連の型定義
 */

/**
 * 解決志向アプローチの9ステップ
 * 1: 感情の受容
 * 2: リフレーミング
 * 3: 目標確認
 * 4: スケーリング（10点満点）
 * 5: 称賛
 * 6: 例外探求
 * 7: 強み発見
 * 8: 選択肢拡大
 * 9: スモールステップ設定
 */
export type CoachingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * 各ステップの詳細情報
 */
export const COACHING_STEP_INFO: Record<
  CoachingStep,
  {
    name: string;
    description: string;
    purpose: string;
  }
> = {
  1: {
    name: "感情の受容",
    description: "ユーザーの感情を言語化して反映する",
    purpose: "心理的安全性の確保と信頼関係の構築",
  },
  2: {
    name: "リフレーミング",
    description: "ネガティブな表現をポジティブに変換する",
    purpose: "視点の転換と可能性への気づき",
  },
  3: {
    name: "目標確認",
    description: "達成したい状態を明確にする",
    purpose: "未来志向の対話の基盤づくり",
  },
  4: {
    name: "スケーリング",
    description: "10点満点で現在地を確認する",
    purpose: "現状の客観的把握と進捗の可視化",
  },
  5: {
    name: "称賛",
    description: "既にできていることを認める",
    purpose: "自己効力感の向上と動機づけ",
  },
  6: {
    name: "例外探求",
    description: "うまくいった時を探す",
    purpose: "成功パターンの発見と再現性の確保",
  },
  7: {
    name: "強み発見",
    description: "対話から強みを抽出して伝える",
    purpose: "リソースの認識と活用促進",
  },
  8: {
    name: "選択肢拡大",
    description: "複数の行動オプションを提案する",
    purpose: "主体的な選択と責任感の醸成",
  },
  9: {
    name: "スモールステップ設定",
    description: "2分で始められる行動に分解する",
    purpose: "行動のハードルを下げ、実行確率を高める",
  },
};

/**
 * セッション種別
 */
export type SessionType =
  | "onboarding" // オンボーディング（価値観インタビュー）
  | "free" // フリーセッション（ユーザー主導）
  | "daily_checkin" // デイリーチェックイン（朝の気分確認）
  | "weekly_review" // 週次振り返り
  | "habit_review" // 習慣振り返り
  | "celebration"; // 称賛セッション（目標達成時）

/**
 * セッション種別ごとの制限
 */
export const SESSION_LIMITS: Record<
  SessionType,
  {
    maxQuestions: number;
    maxDurationMinutes: number;
    description: string;
  }
> = {
  onboarding: {
    maxQuestions: 5,
    maxDurationMinutes: 10,
    description: "価値観を引き出す初回インタビュー",
  },
  free: {
    maxQuestions: 5,
    maxDurationMinutes: 5,
    description: "ユーザー主導の自由対話",
  },
  daily_checkin: {
    maxQuestions: 3,
    maxDurationMinutes: 2,
    description: "朝の気分確認と今日の1アクション",
  },
  weekly_review: {
    maxQuestions: 6,
    maxDurationMinutes: 7,
    description: "1週間の成果と来週の目標",
  },
  habit_review: {
    maxQuestions: 3,
    maxDurationMinutes: 3,
    description: "設定習慣の実施確認",
  },
  celebration: {
    maxQuestions: 3,
    maxDurationMinutes: 2,
    description: "達成時のお祝い対話",
  },
};

/**
 * AIコーチのトーン設定
 */
export type CoachTone = "gentle" | "friendly" | "business";

/**
 * コーチトーンの詳細設定
 */
export const COACH_TONE_CONFIG: Record<
  CoachTone,
  {
    name: string;
    description: string;
    characteristics: string[];
  }
> = {
  gentle: {
    name: "優しい",
    description: "穏やかで温かみのある口調",
    characteristics: [
      "丁寧語を使用",
      "柔らかい表現",
      "励ましの言葉が多い",
      "ゆっくりしたペース",
    ],
  },
  friendly: {
    name: "フランク",
    description: "親しみやすいカジュアルな口調",
    characteristics: [
      "ですます調とタメ口のミックス",
      "絵文字の使用可",
      "共感的な相槌",
      "友達のような距離感",
    ],
  },
  business: {
    name: "ビジネス",
    description: "プロフェッショナルで簡潔な口調",
    characteristics: [
      "敬語を使用",
      "簡潔で要点を押さえた表現",
      "論理的な構成",
      "効率重視",
    ],
  },
};

/**
 * メッセージの型定義
 */
export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  metadata?: MessageMetadata;
}

/**
 * メッセージのメタデータ
 */
export interface MessageMetadata {
  step?: CoachingStep;
  emotion?: string;
  actionItems?: string[];
  scalingScore?: number;
  strengths?: string[];
}

/**
 * ユーザープロファイル（AI用）
 */
export interface AIUserProfile {
  nickname: string;
  purpose: "performance" | "mental" | "change";
  values: string[];
  goals: string[];
  motivation: string;
  strengths: string[];
  tone: CoachTone;
  lifestyle?: {
    wakeUpTime?: string;
    bedTime?: string;
    busyHours?: string[];
  };
}

/**
 * セッションコンテキスト
 */
export interface SessionContext {
  sessionId: string;
  sessionType: SessionType;
  currentStep: CoachingStep;
  questionCount: number;
  userProfile: AIUserProfile;
  conversationHistory: AIMessage[];
  currentTopic?: string;
  extractedInsights: string[];
  suggestedActions: string[];
  emotionalState?: EmotionalState;
}

/**
 * 感情状態
 */
export interface EmotionalState {
  primary: string; // 主要な感情
  intensity: number; // 強度（1-10）
  needsSupport: boolean; // サポートが必要か
}

/**
 * AIレスポンスの型定義
 */
export interface AIResponse {
  message: string;
  nextStep?: CoachingStep;
  metadata?: ResponseMetadata;
  shouldEndSession?: boolean;
}

/**
 * AIレスポンスのメタデータ
 */
export interface ResponseMetadata {
  questionType?: QuestionType;
  suggestedActions?: string[];
  extractedStrengths?: string[];
  emotionalReflection?: string;
  scalingQuestion?: boolean;
}

/**
 * 質問タイプ
 */
export type QuestionType =
  | "open" // オープンクエスチョン
  | "scaling" // スケーリングクエスチョン
  | "exception" // 例外質問
  | "miracle" // ミラクルクエスチョン
  | "coping" // コーピングクエスチョン
  | "confirmation" // 確認質問
  | "action"; // アクション設定質問

/**
 * オンボーディング回答
 */
export interface OnboardingAnswer {
  questionId: string;
  question: string;
  answer: string;
  extractedValues?: string[];
  extractedMotivation?: string;
}

/**
 * オンボーディングセッションの状態
 */
export interface OnboardingState {
  currentQuestionIndex: number;
  answers: OnboardingAnswer[];
  extractedProfile: Partial<AIUserProfile>;
  isComplete: boolean;
}

/**
 * デイリーチェックインの状態
 */
export interface DailyCheckinState {
  mood: number; // 1-10
  todaysFocus?: string;
  plannedAction?: string;
  timestamp: string;
}

/**
 * 週次振り返りの状態
 */
export interface WeeklyReviewState {
  weekHighlight?: string;
  achievementCount: number;
  totalHabits: number;
  successFactors?: string[];
  nextWeekGoals?: string[];
  adjustmentNeeded: boolean;
}

/**
 * ストリーミングイベントの型定義
 */
export interface StreamingEvent {
  type: "text" | "metadata" | "done" | "error";
  content?: string;
  metadata?: ResponseMetadata;
  error?: string;
}

/**
 * AI APIリクエストの型定義
 */
export interface AIRequest {
  messages: AIMessage[];
  context: SessionContext;
  stream?: boolean;
}

/**
 * プロンプトテンプレートの変数
 */
export interface PromptVariables {
  userProfile?: AIUserProfile;
  sessionType?: SessionType;
  currentStep?: CoachingStep;
  conversationHistory?: AIMessage[];
  additionalContext?: Record<string, unknown>;
}
