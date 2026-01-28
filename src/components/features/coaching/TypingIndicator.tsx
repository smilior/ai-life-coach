"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

/**
 * AIタイピングインジケーター
 * - 3ドットアニメーションで入力中を表示
 * - AIメッセージと同じレイアウト（左寄せ、アバター付き）
 */
export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          AI
        </AvatarFallback>
      </Avatar>
      <Card className="bg-muted border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 h-5">
            <TypingDot delay="0ms" />
            <TypingDot delay="150ms" />
            <TypingDot delay="300ms" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TypingDot({ delay }: { delay: string }) {
  return (
    <span
      className="block h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
      style={{ animationDelay: delay, animationDuration: "0.8s" }}
    />
  );
}
