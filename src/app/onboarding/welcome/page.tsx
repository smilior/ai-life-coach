"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingProgressSimple, useOnboarding } from "@/components/features/onboarding";
import { Sparkles, Target, MessageSquare, TrendingUp } from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: Target,
    title: "目標設定",
    description: "あなたに合った目標を一緒に見つけます",
  },
  {
    icon: MessageSquare,
    title: "AIコーチング",
    description: "毎日の対話で成長をサポート",
  },
  {
    icon: TrendingUp,
    title: "習慣形成",
    description: "小さな一歩から大きな変化へ",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const { goToStep } = useOnboarding();

  useEffect(() => {
    goToStep(0);
  }, [goToStep]);

  const handleStart = () => {
    router.push("/onboarding/purpose");
  };

  return (
    <>
      {/* Progress Header */}
      <header className="p-4">
        <OnboardingProgressSimple currentStep={0} />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              AIライフコーチへようこそ
            </h1>
            <p className="text-muted-foreground">
              あなただけの成長プランを一緒に作りましょう。
              <br />
              約2分で完了します。
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-muted">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <feature.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleStart}
            size="xl"
            className="w-full"
          >
            始める
          </Button>

          {/* Skip Option */}
          <p className="text-center text-xs text-muted-foreground">
            後からいつでも設定を変更できます
          </p>
        </div>
      </main>
    </>
  );
}
