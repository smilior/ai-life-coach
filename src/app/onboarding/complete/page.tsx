"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  OnboardingProgressSimple,
  useOnboarding,
} from "@/components/features/onboarding";
import { PartyPopper, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const completionItems = [
  "目的の設定",
  "価値観の明確化",
  "動機の深掘り",
];

export default function CompletePage() {
  const router = useRouter();
  const { data, goToStep } = useOnboarding();
  const [showItems, setShowItems] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    goToStep(4);
  }, [goToStep]);

  // Animate completion items
  useEffect(() => {
    const timers = completionItems.map((_, index) =>
      setTimeout(() => {
        setShowItems((prev) => {
          const newItems = [...prev];
          newItems[index] = true;
          return newItems;
        });
      }, 300 + index * 200)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const handleGoToDashboard = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: data.purpose,
          values: data.valueAnswers.map((va) => va.answer),
          motivation: data.motivation,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to save profile:", err);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
    router.push("/dashboard");
  };

  const purposeLabel = data.purpose === "performance"
    ? "パフォーマンス向上"
    : data.purpose === "mental"
    ? "メンタル安定"
    : data.purpose === "change"
    ? "変革"
    : "";

  return (
    <>
      {/* Progress Header */}
      <header className="p-4">
        <OnboardingProgressSimple currentStep={4} />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md space-y-8">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                <PartyPopper className="h-12 w-12 text-primary" />
              </div>
              <Sparkles className="absolute -right-2 -top-2 h-8 w-8 text-amber-500" />
            </div>
          </div>

          {/* Celebration Message */}
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              おめでとうございます！
            </h1>
            <p className="text-muted-foreground">
              オンボーディングが完了しました。
              <br />
              AIコーチがあなたの成長をサポートする準備ができています。
            </p>
          </div>

          {/* Completion Summary */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="font-semibold">完了した設定</h2>
              <div className="space-y-3">
                {completionItems.map((item, index) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      showItems[index]
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Purpose Summary */}
          {purposeLabel && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">あなたの目標</p>
                <p className="mt-1 text-lg font-semibold text-primary">
                  {purposeLabel}
                </p>
              </CardContent>
            </Card>
          )}

          {/* CTA Button */}
          <Button
            onClick={handleGoToDashboard}
            size="xl"
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? "保存中..." : "ダッシュボードへ"}
            {!isSaving && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>

          {/* Note */}
          <p className="text-center text-xs text-muted-foreground">
            設定はいつでも変更できます
          </p>
        </div>
      </main>
    </>
  );
}
