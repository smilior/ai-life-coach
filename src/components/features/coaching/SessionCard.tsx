"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, MessageCircle, Zap } from "lucide-react";
import type { CoachingStep } from "@/types/ai";

export interface SessionData {
  id: string;
  theme: string;
  status: "active" | "completed";
  currentStep?: CoachingStep;
  startedAt: Date;
  endedAt?: Date;
  messageCount?: number;
}

interface SessionCardProps {
  session: SessionData;
  className?: string;
}

/**
 * セッション一覧カードコンポーネント
 * - 進行中: 目立つスタイル（続ける/新規開始ボタン）
 * - 完了: シンプルなスタイル（詳細リンク）
 */
export function SessionCard({ session, className }: SessionCardProps) {
  const isActive = session.status === "active";

  if (isActive) {
    return <ActiveSessionCard session={session} className={className} />;
  }

  return <CompletedSessionCard session={session} className={className} />;
}

/**
 * 進行中セッションカード
 */
function ActiveSessionCard({
  session,
  className,
}: {
  session: SessionData;
  className?: string;
}) {
  const timeAgo = getRelativeTime(session.startedAt);

  return (
    <Card
      className={cn(
        "border-primary/30 bg-primary/5 shadow-sm",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="text-[10px]">
                進行中
              </Badge>
            </div>
            <h3 className="font-medium text-sm truncate">
              {session.theme || "フリーセッション"}
            </h3>
            {session.currentStep && (
              <p className="text-xs text-muted-foreground mt-0.5">
                ステップ {session.currentStep}/9
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              最終更新: {timeAgo}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/coaching/chat?session=${session.id}`}>
              続ける
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/coaching/chat">新規開始</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 完了済みセッションカード
 */
function CompletedSessionCard({
  session,
  className,
}: {
  session: SessionData;
  className?: string;
}) {
  const dateStr = session.endedAt
    ? formatDate(session.endedAt)
    : formatDate(session.startedAt);

  return (
    <Link href={`/coaching/summary/${session.id}`}>
      <Card
        className={cn(
          "shadow-sm hover:bg-accent/50 transition-colors",
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {dateStr}
                </span>
              </div>
              <h3 className="font-medium text-sm truncate">
                {session.theme || "フリーセッション"}
              </h3>
              {session.messageCount !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  <MessageCircle className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {session.messageCount} メッセージ
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="outline" className="text-[10px]">
                完了
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * 相対時間表示
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return formatDate(date);
}

/**
 * 日付フォーマット
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
