"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  OnboardingProgressSimple,
  useOnboarding,
} from "@/components/features/onboarding";
import { ArrowLeft, Target, Heart, Sparkles } from "lucide-react";

const purposeLabels = {
  performance: {
    label: "パフォーマンス向上",
    icon: Target,
    question: "パフォーマンス向上が今のあなたにとって大切な理由は何ですか？",
    placeholder: "例：新しいプロジェクトをリードできるようになりたい、専門性を高めて市場価値を上げたい、など...",
  },
  mental: {
    label: "メンタル安定",
    icon: Heart,
    question: "心の安定が今のあなたにとって大切な理由は何ですか？",
    placeholder: "例：日々の不安を減らしたい、もっと自分に自信を持ちたい、など...",
  },
  change: {
    label: "変革",
    icon: Sparkles,
    question: "この変革が今のあなたにとって大切な理由は何ですか？",
    placeholder: "例：本当にやりたいことに挑戦したい、環境を変えて成長したい、など...",
  },
};

export default function MotivationPage() {
  const router = useRouter();
  const { data, setMotivation, goToStep } = useOnboarding();

  useEffect(() => {
    goToStep(3);
  }, [goToStep]);

  const handleNext = () => {
    if (data.motivation.trim()) {
      router.push("/onboarding/complete");
    }
  };

  const handleBack = () => {
    router.push("/onboarding/values");
  };

  const purposeInfo = data.purpose ? purposeLabels[data.purpose] : null;

  return (
    <>
      {/* Progress Header */}
      <header className="p-4">
        <OnboardingProgressSimple currentStep={3} />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-4 pb-8">
        <div className="mx-auto w-full max-w-md flex-1 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              動機を深掘りしましょう
            </h1>
            <p className="text-muted-foreground">
              「なぜ」を明確にすることで、
              <br />
              モチベーションを維持しやすくなります。
            </p>
          </div>

          {/* Selected Purpose */}
          {purposeInfo && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <purposeInfo.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">選択した目的</p>
                  <p className="font-medium">{purposeInfo.label}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Motivation Question */}
          <div className="space-y-4">
            <label
              htmlFor="motivation"
              className="block text-lg font-semibold leading-relaxed"
            >
              {purposeInfo?.question || "この目標が大切な理由は何ですか？"}
            </label>
            <Textarea
              id="motivation"
              value={data.motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder={purposeInfo?.placeholder || "あなたの想いを自由にお書きください..."}
              className="min-h-[180px] resize-none text-base"
              autoFocus
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                深い理由を書くほど、AIコーチがあなたを理解しやすくなります
              </span>
              <span>{data.motivation.length} 文字</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Navigation */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <Button
              onClick={handleNext}
              disabled={!data.motivation.trim()}
              className="flex-1"
            >
              次へ
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
