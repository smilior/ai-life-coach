"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MessageCircle, Sparkles } from "lucide-react";
import { SessionCard, type SessionData } from "@/components/features/coaching";

/**
 * デモ用のセッションデータ
 * 実際のAPI連携時にはサーバーからフェッチする
 */
const DEMO_SESSIONS: SessionData[] = [
  {
    id: "session-active-1",
    theme: "仕事のストレス対策",
    status: "active",
    currentStep: 5,
    startedAt: new Date(Date.now() - 10 * 60 * 1000),
    messageCount: 8,
  },
  {
    id: "session-completed-1",
    theme: "キャリアの方向性",
    status: "completed",
    startedAt: new Date("2026-01-22T10:00:00"),
    endedAt: new Date("2026-01-22T10:15:00"),
    messageCount: 12,
  },
  {
    id: "session-completed-2",
    theme: "運動習慣の確立",
    status: "completed",
    startedAt: new Date("2026-01-20T09:00:00"),
    endedAt: new Date("2026-01-20T09:10:00"),
    messageCount: 10,
  },
  {
    id: "session-completed-3",
    theme: "時間管理の改善",
    status: "completed",
    startedAt: new Date("2026-01-18T14:00:00"),
    endedAt: new Date("2026-01-18T14:12:00"),
    messageCount: 9,
  },
];

/**
 * セッション管理画面
 * - 新規セッション開始
 * - 進行中のセッション一覧
 * - 過去のセッション履歴
 */
export default function CoachingPage() {
  const [sessions] = useState<SessionData[]>(DEMO_SESSIONS);

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
