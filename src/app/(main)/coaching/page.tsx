"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { SessionCard, type SessionData } from "@/components/features/coaching";
import type { CoachingStep } from "@/types/ai";

/**
 * APIレスポンスのセッション型
 */
interface ApiSessionResponse {
  id: string;
  title: string;
  sessionType: string;
  status: string;
  currentStep: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * APIレスポンスをSessionDataに変換
 */
function mapApiSessionToSessionData(apiSession: ApiSessionResponse): SessionData {
  const status: "active" | "completed" =
    apiSession.status === "active" ? "active" : "completed";

  const currentStep =
    apiSession.currentStep >= 1 && apiSession.currentStep <= 9
      ? (apiSession.currentStep as CoachingStep)
      : undefined;

  return {
    id: apiSession.id,
    theme: apiSession.title,
    status,
    currentStep,
    startedAt: new Date(apiSession.startedAt),
    endedAt: apiSession.completedAt
      ? new Date(apiSession.completedAt)
      : undefined,
  };
}

/**
 * セッション管理画面
 * - 新規セッション開始
 * - 進行中のセッション一覧
 * - 過去のセッション履歴
 */
export default function CoachingPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/coaching/sessions");
        if (!response.ok) {
          throw new Error("セッションの取得に失敗しました");
        }
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setSessions(json.data.map(mapApiSessionToSessionData));
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error("Failed to fetch coaching sessions:", err);
        setError(
          err instanceof Error
            ? err.message
            : "セッションの取得に失敗しました"
        );
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessions();
  }, []);

  const activeSessions = sessions.filter((s) => s.status === "active");
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)]">
      {/* ヘッダー */}
      <header className="border-b bg-background px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">コーチング</h1>
          <Button asChild size="sm">
            <Link href="/coaching/chat">
              <Plus className="h-4 w-4 mr-1.5" />
              新規セッション
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* コーチ紹介カード */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm">AIライフコーチ</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    解決志向アプローチで、あなたの内なる答えを引き出します
                  </p>
                </div>
              </div>
              <Button asChild className="w-full mt-3" size="sm">
                <Link href="/coaching/chat">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  コーチと話す
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* ローディング状態 */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                読み込み中...
              </span>
            </div>
          )}

          {/* エラー状態 */}
          {!isLoading && error && (
            <Card className="border-destructive/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  再読み込み
                </Button>
              </CardContent>
            </Card>
          )}

          {/* セッション一覧 */}
          {!isLoading && !error && (
            <>
              {/* 進行中のセッション */}
              {activeSessions.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    進行中のセッション
                  </h2>
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                </section>
              )}

              {/* 過去のセッション */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                  過去のセッション
                </h2>
                {completedSessions.length > 0 ? (
                  <div className="space-y-2">
                    {completedSessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * セッション履歴が空の場合の表示
 */
function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-6 text-center">
        <div className="rounded-full bg-muted p-3 inline-flex mb-3">
          <MessageCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          まだセッション履歴がありません
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          AIコーチと話して、あなたの目標に向けた一歩を踏み出しましょう
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/coaching/chat">最初のセッションを始める</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
