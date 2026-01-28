/**
 * ユーザー関連の型定義
 */
export interface User {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 習慣関連の型定義
 */
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetTime?: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  streak: number;
  bestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export type HabitCategory = "health" | "learning" | "mind" | "work" | "other";

export type HabitFrequency = "daily" | "weekly" | "custom";

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;
  note?: string;
}

/**
 * コーチングセッション関連の型定義
 */
export interface CoachingSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  theme?: string;
  summary?: string;
  insights: string[];
  actionItems: string[];
}

export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

/**
 * 進捗・統計関連の型定義
 */
export interface DailyStats {
  date: string;
  completedHabits: number;
  totalHabits: number;
  coachingSessions: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  condition: BadgeCondition;
}

export interface BadgeCondition {
  type: "streak" | "total_completions" | "sessions" | "custom";
  value: number;
}

/**
 * オンボーディング関連の型定義
 */
export interface OnboardingData {
  purpose: "performance" | "mental" | "change";
  values: string[];
  goals: string[];
  motivation: string;
  lifestyle: {
    wakeUpTime?: string;
    bedTime?: string;
    busyHours?: string[];
  };
}

/**
 * API レスポンス型定義
 */
export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * ページネーション型定義
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
