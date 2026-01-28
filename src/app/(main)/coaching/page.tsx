import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export const metadata: Metadata = {
  title: "コーチング | AIライフコーチ",
  description: "AIコーチとの対話で、あなたの目標達成をサポートします。",
};

export default function CoachingPage() {
  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      {/* ヘッダー */}
      <header className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/coach-avatar.png" alt="AIコーチ" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              AI
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold">AIコーチ</h1>
            <p className="text-xs text-muted-foreground">
              あなたの成長をサポートします
            </p>
          </div>
        </div>
      </header>

      {/* チャットエリア */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* AIメッセージ */}
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                AI
              </AvatarFallback>
            </Avatar>
            <Card className="max-w-[80%]">
              <CardContent className="p-3 text-sm">
                <p>こんにちは！今日はどんなことについて話しましょうか？</p>
                <p className="mt-2">
                  目標に向けた進捗や、最近感じていることなど、なんでも気軽に話してくださいね。
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ユーザーメッセージ（例） */}
          <div className="flex justify-end gap-3">
            <Card className="max-w-[80%] bg-primary text-primary-foreground">
              <CardContent className="p-3 text-sm">
                <p>最近、朝の習慣を続けるのが難しいと感じています...</p>
              </CardContent>
            </Card>
          </div>

          {/* AIメッセージ */}
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                AI
              </AvatarFallback>
            </Avatar>
            <Card className="max-w-[80%]">
              <CardContent className="p-3 text-sm">
                <p>朝の習慣を続けることに挑戦されているんですね。素晴らしいことです！</p>
                <p className="mt-2">
                  具体的にどんな習慣を続けようとしていますか？また、どんな時に難しいと感じますか？
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* 入力エリア */}
      <div className="border-t p-4 safe-area-inset-bottom">
        <form className="flex gap-2">
          <Textarea
            placeholder="メッセージを入力..."
            className="min-h-[44px] resize-none"
            rows={1}
          />
          <Button type="submit" size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
            <span className="sr-only">送信</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
