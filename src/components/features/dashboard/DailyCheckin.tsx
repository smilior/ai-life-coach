"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, SmilePlus } from "lucide-react";
import Link from "next/link";

interface DailyCheckinProps {
  selectedMood?: string | null;
  onMoodSelect?: (mood: string) => void;
}

const moodOptions = [
  { emoji: "😊", label: "良い", value: "good" },
  { emoji: "😐", label: "普通", value: "neutral" },
  { emoji: "😔", label: "落ち込み", value: "down" },
  { emoji: "😤", label: "イライラ", value: "irritated" },
  { emoji: "😴", label: "疲れ", value: "tired" },
];

export function DailyCheckin({
  selectedMood = null,
  onMoodSelect,
}: DailyCheckinProps) {
  const moodParam = selectedMood
    ? `?mood=${encodeURIComponent(selectedMood)}`
    : "";

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">デイリーチェックイン</h2>

      {/* 気分チェック */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <SmilePlus className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">今日の気分は?</p>
          </div>
          <div className="flex justify-between gap-2">
            {moodOptions.map((mood) => {
              const isSelected = selectedMood === mood.value;
              return (
                <button
                  key={mood.label}
                  type="button"
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                    isSelected
                      ? "bg-primary/10 ring-2 ring-primary/50"
                      : "hover:bg-muted active:bg-muted/80"
                  }`}
                  aria-label={mood.label}
                  aria-pressed={isSelected}
                  onClick={() => onMoodSelect?.(mood.value)}
                >
                  <span className={`text-2xl ${isSelected ? "scale-110" : ""} transition-transform`}>
                    {mood.emoji}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isSelected
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* コーチングCTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold">AIコーチと話す</h3>
                <p className="text-sm text-muted-foreground">
                  今日の気分や目標について相談しましょう
                </p>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link href={`/coaching${moodParam}`}>コーチングを始める</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
