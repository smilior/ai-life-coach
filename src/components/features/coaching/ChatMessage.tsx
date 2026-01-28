"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { CoachingStep } from "@/types/ai";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  step?: CoachingStep;
}

interface ChatMessageProps {
  message: ChatMessageData;
  isStreaming?: boolean;
}

/**
 * チャットメッセージバブルコンポーネント
 * - ユーザーメッセージ: 右寄せ、primary色背景
 * - AIメッセージ: 左寄せ、muted背景、アバター付き
 */
export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 animate-slide-up">
        <Card className="max-w-[80%] bg-primary text-primary-foreground border-0 shadow-sm">
          <CardContent className="p-3 text-sm">
            <MessageContent content={message.content} />
            <MessageTimestamp
              timestamp={message.timestamp}
              className="text-primary-foreground/70"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-slide-up">
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          AI
        </AvatarFallback>
      </Avatar>
      <Card className="max-w-[80%] bg-muted border-0 shadow-sm">
        <CardContent className="p-3 text-sm">
          <MessageContent content={message.content} />
          {isStreaming && <StreamingCursor />}
          <MessageTimestamp
            timestamp={message.timestamp}
            className="text-muted-foreground/70"
          />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * メッセージ本文の表示（改行・段落を維持）
 */
function MessageContent({ content }: { content: string }) {
  const paragraphs = content.split("\n\n");
  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, idx) => {
        const lines = paragraph.split("\n");
        return (
          <div key={idx}>
            {lines.map((line, lineIdx) => (
              <p key={lineIdx} className={cn(lineIdx > 0 && "mt-1")}>
                {renderBoldText(line)}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * **太字** 記法を簡易的にレンダリング
 */
function renderBoldText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

/**
 * ストリーミング中のカーソルアニメーション
 */
function StreamingCursor() {
  return (
    <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 align-text-bottom" />
  );
}

/**
 * メッセージタイムスタンプ
 */
function MessageTimestamp({
  timestamp,
  className,
}: {
  timestamp: Date;
  className?: string;
}) {
  const timeStr = timestamp.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <p className={cn("text-[10px] mt-1.5 text-right", className)}>
      {timeStr}
    </p>
  );
}
