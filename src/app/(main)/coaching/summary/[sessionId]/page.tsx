"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
} from "lucide-react";
import { SessionProgress } from "@/components/features/coaching";
import type { CoachingStep } from "@/types/ai";

/**
 * APIレスポンスのセッション詳細型（基本情報のみ）
 */
interface ApiSessionDetail {
  id: string;
  title: string;
  sessionType: string;
  status: string;
  currentStep: number;
  startedAt: string;
  completedAt: string | null;
  messages: Array<{ id: string }>;
}

/**
 * AI生成サマリーの習慣提案型
 */
interface HabitSuggestion {
  name: string;
  description: string;
  category: "health" | "learning" | "work" | "life" | "other";
  twoMinuteVersion: string;
  trigger: string;
  ifThenPlan: string;
  frequency: "daily" | "weekdays" | "weekends";
}

/**
 * AI生成サマリーの型
 */
interface AISummary {
  theme: string;
  goal: string;
  currentState: string;
  strengths: string[];
  actionItems: string[];
  coachMessage: string;
  habitSuggestion: HabitSuggestion;
}

/**
 * 表示用セッション基本情報
 */
interface SessionBasicInfo {
  id: string;
  date: string;
  duration: string;
  messageCount: number;
  completedSteps: CoachingStep;
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
 * セッションサマリー画面
 * - セッション完了後のまとめ
 * - AIによる構造化サマリー生成
 * - 「おすすめの習慣を登録」ボタン
 */
export default function SessionSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [basicInfo, setBasicInfo] = useState<SessionBasicInfo | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [isLoadingBasic, setIsLoadingBasic] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Stage 1: セッション基本情報取得
  useEffect(() => {
    async function fetchBasicInfo() {
      try {
        setIsLoadingBasic(true);
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
          const data = json.data as ApiSessionDetail;
          const completedSteps =
            data.currentStep >= 1 && data.currentStep <= 9
              ? (data.currentStep as CoachingStep)
              : (9 as CoachingStep);
          setBasicInfo({
            id: data.id,
            date: formatDateJa(data.startedAt),
            duration: calculateDuration(data.startedAt, data.completedAt),
            messageCount: data.messages.length,
            completedSteps,
          });
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
        setIsLoadingBasic(false);
      }
    }

    fetchBasicInfo();
  }, [sessionId]);

  // Stage 2: AIサマリー生成
  const fetchSummary = useCallback(async () => {
    try {
      setIsLoadingSummary(true);
      setSummaryError(null);
      const response = await fetch(
        `/api/coaching/sessions/${sessionId}/summary`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error("サマリーの生成に失敗しました");
      }
      const json = await response.json();
      if (json.success && json.data) {
        setAiSummary(json.data as AISummary);
      } else {
        throw new Error("サマリーの生成に失敗しました");
      }
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setSummaryError(
        err instanceof Error
          ? err.message
          : "サマリーの生成に失敗しました"
      );
    } finally {
      setIsLoadingSummary(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (basicInfo && !aiSummary && !summaryError) {
      fetchSummary();
    }
  }, [basicInfo, aiSummary, summaryError, fetchSummary]);

  // ヘッダーコンポーネント
  const pageHeader = (
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
  );

  // ローディング状態（基本情報取得中）
  if (isLoadingBasic) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
        {pageHeader}
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            読み込み中...
          </span>
        </div>
      </div>
    );
  }

  // エラー状態（基本情報取得失敗）
  if (error || !basicInfo) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
        {pageHeader}
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

  // 習慣登録リンクの生成
  function buildHabitLink(habit: HabitSuggestion): string {
    const p = new URLSearchParams();
    p.set("name", habit.name);
    p.set("description", habit.description);
    p.set("category", habit.category);
    p.set("twoMinuteVersion", habit.twoMinuteVersion);
    p.set("trigger", habit.trigger);
    p.set("ifThenPlan", habit.ifThenPlan);
    p.set("frequency", habit.frequency);
    return `/habits/new?${p.toString()}`;
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
      {pageHeader}

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
            <span>{basicInfo.date}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>{basicInfo.duration}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>{basicInfo.messageCount} メッセージ</span>
          </div>

          {/* 進捗表示 */}
          <SessionProgress currentStep={basicInfo.completedSteps} />

          {/* AI サマリー部分 */}
          {isLoadingSummary && (
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      AIがセッションを分析しています...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      会話内容から目標・強み・習慣提案を生成中
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {summaryError && (
            <Card className="border-destructive/50">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-destructive">{summaryError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={fetchSummary}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  再試行
                </Button>
              </CardContent>
            </Card>
          )}

          {aiSummary && (
            <>
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
                    <p className="text-sm">{aiSummary.theme}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      設定した目標
                    </p>
                    <p className="text-sm">{aiSummary.goal}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      現在地
                    </p>
                    <p className="text-sm">{aiSummary.currentState}</p>
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
                    {aiSummary.strengths.map((strength) => (
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
                    {aiSummary.actionItems.map((item, idx) => (
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
                    {aiSummary.coachMessage
                      .split("\n\n")
                      .map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* アクションボタン */}
              <div className="space-y-2 pt-2 pb-4">
                <Button asChild className="w-full" size="lg">
                  <Link href={buildHabitLink(aiSummary.habitSuggestion)}>
                    <Target className="h-4 w-4 mr-2" />
                    おすすめの習慣を登録
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href="/dashboard">
                    <Home className="h-4 w-4 mr-2" />
                    ホームに戻る
                  </Link>
                </Button>
              </div>
            </>
          )}

          {/* サマリーがまだない場合のホームボタン */}
          {!aiSummary && !isLoadingSummary && !summaryError && (
            <div className="space-y-2 pt-2 pb-4">
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  ホームに戻る
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
