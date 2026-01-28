import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Target, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "はじめましょう | AIライフコーチ",
  description: "AIライフコーチへようこそ。あなたの目標設定をサポートします。",
};

const purposes = [
  {
    id: "performance",
    title: "パフォーマンス向上",
    description: "キャリアアップやスキル習得を目指す",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "mental",
    title: "メンタル安定",
    description: "ストレス軽減や自己肯定感アップ",
    icon: Heart,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "change",
    title: "変革",
    description: "転職や独立など人生の転機に",
    icon: Sparkles,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 進捗バー */}
      <header className="p-4">
        <Progress value={20} className="h-1" />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          ステップ 1 / 5
        </p>
      </header>

      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md space-y-8">
          {/* ウェルカムメッセージ */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              AIライフコーチへようこそ
            </h1>
            <p className="mt-2 text-muted-foreground">
              まずはあなたの目的を教えてください
            </p>
          </div>

          {/* 目的選択 */}
          <div className="space-y-3">
            {purposes.map((purpose) => (
              <Card
                key={purpose.id}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${purpose.bgColor}`}
                  >
                    <purpose.icon className={`h-6 w-6 ${purpose.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{purpose.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {purpose.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 次へボタン */}
          <Button className="w-full" size="lg">
            次へ進む
          </Button>
        </div>
      </main>
    </div>
  );
}
