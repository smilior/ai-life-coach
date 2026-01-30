"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  Target,
  Lightbulb,
  ListChecks,
  Sparkles,
  Home,
  Loader2,
} from "lucide-react";
import { SessionProgress } from "@/components/features/coaching";
import type { CoachingStep } from "@/types/ai";

/**
 * APIレスポンスのメッセージ型
 */
interface ApiMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  step: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * APIレスポンスのセッション詳細型
 */
interface ApiSessionDetail {
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
  messages: ApiMessage[];
}

/**
 * サマリー表示用の型
 */
interface SessionSummary {
  id: string;
  theme: string;
  date: string;
  duration: string;
  messageCount: number;
  completedSteps: CoachingStep;
  goal: string;
  currentState: string;
  strengths: string[];
  actionItems: string[];
  coachMessage: string;
}

/**
 * 所要時間を計算する
 */
function calculateDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "--";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const diffMinutes = Math.round((end - start) / 60000);
  if (diffMinutes < 1) return "1分未満";
  return `${diffMinutes}分`;
}

/**
 * 日付をフォーマットする
 */
function formatDateJa(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * メッセージのmetadataから情報を抽出する
 */
function extractFromMessages(messages: ApiMessage[]): {
  strengths: string[];
  actionItems: string[];
  goal: string;
  currentState: string;
} {
  const strengths: string[] = [];
  const actionItems: string[] = [];
  let goal = "";
  let currentState = "";

  for (const msg of messages) {
    if (msg.metadata) {
      if (Array.isArray(msg.metadata.strengths)) {
        strengths.push(
          ...(msg.metadata.strengths as string[]).filter(
            (s) => !strengths.includes(s)
          )
        );
      }
      if (Array.isArray(msg.metadata.actionItems)) {
        actionItems.push(
          ...(msg.metadata.actionItems as string[]).filter(
            (a) => !actionItems.includes(a)
          )
        );
      }
      if (typeof msg.metadata.goal === "string" && msg.metadata.goal) {
        goal = msg.metadata.goal;
      }
      if (
        typeof msg.metadata.currentState === "string" &&
        msg.metadata.currentState
      ) {
        currentState = msg.metadata.currentState;
      }
    }
  }

  return { strengths, actionItems, goal, currentState };
}

/**
 * コーチからの最後のメッセージを取得する
 */
function getLastCoachMessage(messages: ApiMessage[]): string {
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  if (assistantMessages.length === 0) {
    return "セッションにご参加いただきありがとうございました。引き続き目標に向けて頑張りましょう！";
  }
  return assistantMessages[assistantMessages.length - 1].content;
}

/**
 * APIレスポンスをサマリーに変換
 */
function mapApiToSummary(apiSession: ApiSessionDetail): SessionSummary {
  const extracted = extractFromMessages(apiSession.messages);

  const completedSteps =
    apiSession.currentStep >= 1 && apiSession.currentStep <= 9
      ? (apiSession.currentStep as CoachingStep)
      : (9 as CoachingStep);

  return {
    id: apiSession.id,
    theme: apiSession.title,
    date: formatDateJa(apiSession.startedAt),
    duration: calculateDuration(apiSession.startedAt, apiSession.completedAt),
    messageCount: apiSession.messages.length,
    completedSteps,
    goal:
      extracted.goal ||
      (apiSession.context?.goal as string) ||
      "セッション内で目標を設定しました",
    currentState:
      extracted.currentState ||
      (apiSession.context?.currentState as string) ||
      "セッション内で現在地を確認しました",
    strengths:
      extracted.strengths.length > 0
        ? extracted.strengths
        : ["セッションを完了する意欲"],
    actionItems:
      extracted.actionItems.length > 0
        ? extracted.actionItems
        : ["セッションで得た気づきを振り返る"],
    coachMessage:
      apiSession.summary || getLastCoachMessage(apiSession.messages),
  };
}

/**
 * セッションサマリー画面
 * - セッション完了後のまとめ
 * - 目標・現在地・次のステップ
 * - 「この目標を習慣に登録」ボタン
 */
export default function SessionSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessionDetail() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/coaching/sessions/${sessionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("セッションが見つかりませんでした");
          }
          throw new Error("セッション情報の取得に失敗しました");
        }
        const json = await response.json();
        if (json.success && json.data) {
          setSummary(mapApiToSummary(json.data));
        } else {
          throw new Error("セッション情報の取得に失敗しました");
        }
      } catch (err) {
        console.error("Failed to fetch session detail:", err);
        setError(
          err instanceof Error
            ? err.message
            : "セッション情報の取得に失敗しました"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessionDetail();
  }, [sessionId]);

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
        <header className="border-b bg-background">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -ml-2"
              onClick={() => router.push("/coaching")}
              aria-label="戻る"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-sm">セッション完了</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            読み込み中...
          </span>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error || !summary) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
        <header className="border-b bg-background">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -ml-2"
              onClick={() => router.push("/coaching")}
              aria-label="戻る"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-sm">セッション完了</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm border-destructive/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-destructive">
                {error || "セッション情報を表示できませんでした"}
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/coaching")}
                >
                  一覧に戻る
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  再読み込み
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
      {/* ヘッダー */}
      <header className="border-b bg-background">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -ml-2"
            onClick={() => router.push("/coaching")}
            aria-label="戻る"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-sm">セッション完了</h1>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* 完了バナー */}
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-lg font-bold">お疲れさまでした！</h2>
            <p className="text-sm text-muted-foreground mt-1">
              素晴らしいセッションでした
            </p>
          </div>

          {/* セッション情報 */}
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>{summary.date}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>{summary.duration}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>{summary.messageCount} メッセージ</span>
          </div>

          {/* 進捗表示 */}
          <SessionProgress currentStep={summary.completedSteps} />

          {/* セッションまとめカード */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                セッションまとめ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  テーマ
                </p>
                <p className="text-sm">{summary.theme}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  設定した目標
                </p>
                <p className="text-sm">{summary.goal}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  現在地
                </p>
                <p className="text-sm">{summary.currentState}</p>
              </div>
            </CardContent>
          </Card>

          {/* 発見した強み */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" />
                あなたの強み
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {summary.strengths.map((strength) => (
                  <Badge key={strength} variant="secondary">
                    {strength}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 次のステップ */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-success" />
                次のステップ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {summary.actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-success/10 text-success text-xs flex items-center justify-center font-medium mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* コーチからのメッセージ */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                コーチからのメッセージ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                {summary.coachMessage.split("\n\n").map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="space-y-2 pt-2 pb-4">
            <Button asChild className="w-full" size="lg">
              <Link
                href={(() => {
                  const params = new URLSearchParams();
                  if (summary.goal) params.set("name", summary.goal);
                  if (summary.actionItems.length > 0) {
                    params.set("twoMinuteVersion", summary.actionItems[0]);
                  }
                  if (summary.currentState) {
                    params.set("description", summary.currentState);
                  }
                  const qs = params.toString();
                  return `/habits/new${qs ? `?${qs}` : ""}`;
                })()}
              >
                <Target className="h-4 w-4 mr-2" />
                この目標を習慣に登録
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
