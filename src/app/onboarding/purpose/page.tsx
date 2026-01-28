"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  OnboardingProgressSimple,
  PurposeCard,
  useOnboarding,
  type PurposeType,
} from "@/components/features/onboarding";
import { Target, Heart, Sparkles, ArrowLeft } from "lucide-react";

const purposes: Array<{
  id: PurposeType;
  title: string;
  description: string;
  icon: typeof Target;
  color: string;
  bgColor: string;
}> = [
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
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    id: "change",
    title: "変革",
    description: "転職や独立など人生の転機に",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

export default function PurposePage() {
  const router = useRouter();
  const { data, setPurpose, goToStep } = useOnboarding();

  useEffect(() => {
    goToStep(1);
  }, [goToStep]);

  const handleNext = () => {
    if (data.purpose) {
      router.push("/onboarding/values");
    }
  };

  const handleBack = () => {
    router.push("/onboarding/welcome");
  };

  return (
    <>
      {/* Progress Header */}
      <header className="p-4">
        <OnboardingProgressSimple currentStep={1} />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-4 pb-8">
        <div className="mx-auto w-full max-w-md flex-1 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              あなたの目的は？
            </h1>
            <p className="text-muted-foreground">
              AIコーチングの方向性を決めるため、
              <br />
              今一番達成したい目的を選んでください。
            </p>
          </div>

          {/* Purpose Cards */}
          <div className="space-y-3">
            {purposes.map((purpose) => (
              <PurposeCard
                key={purpose.id}
                {...purpose}
                isSelected={data.purpose === purpose.id}
                onSelect={() => setPurpose(purpose.id)}
              />
            ))}
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
              disabled={!data.purpose}
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
