"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lightbulb,
  Clock,
  Target,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HabitCategory } from "./CategoryBadge";

// ========================================
// Types
// ========================================

export interface HabitFormData {
  name: string;
  description?: string;
  category: HabitCategory;
  twoMinuteVersion?: string;
  trigger?: string;
  ifThenPlan?: string;
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  customDays?: number[];
  reminderTime?: string;
  targetDays?: number;
}

interface HabitFormProps {
  initialData?: Partial<HabitFormData>;
  onSubmit: (data: HabitFormData) => Promise<void>;
  submitLabel?: string;
  isEditing?: boolean;
}

// ========================================
// Constants
// ========================================

const categories: Array<{ value: HabitCategory; label: string; icon: string }> =
  [
    { value: "health", label: "健康", icon: "💪" },
    { value: "learning", label: "学習", icon: "📚" },
    { value: "work", label: "仕事", icon: "💼" },
    { value: "life", label: "生活", icon: "🏠" },
    { value: "other", label: "その他", icon: "📌" },
  ];

const frequencies: Array<{
  value: "daily" | "weekdays" | "weekends" | "custom";
  label: string;
}> = [
  { value: "daily", label: "毎日" },
  { value: "weekdays", label: "平日" },
  { value: "weekends", label: "週末" },
  { value: "custom", label: "カスタム" },
];

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

// ========================================
// Component
// ========================================

export function HabitForm({
  initialData,
  onSubmit,
  submitLabel = "習慣を作成",
  isEditing = false,
}: HabitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [category, setCategory] = useState<HabitCategory>(
    initialData?.category ?? "health"
  );
  const [twoMinuteVersion, setTwoMinuteVersion] = useState(
    initialData?.twoMinuteVersion ?? ""
  );
  const [trigger, setTrigger] = useState(initialData?.trigger ?? "");
  const [ifThenPlan, setIfThenPlan] = useState(
    initialData?.ifThenPlan ?? ""
  );
  const [frequency, setFrequency] = useState<
    "daily" | "weekdays" | "weekends" | "custom"
  >(initialData?.frequency ?? "daily");
  const [customDays, setCustomDays] = useState<number[]>(
    initialData?.customDays ?? []
  );
  const [reminderTime, setReminderTime] = useState(
    initialData?.reminderTime ?? ""
  );
  const [targetDays, setTargetDays] = useState<string>(
    initialData?.targetDays?.toString() ?? ""
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "習慣名は必須です";
    } else if (name.length > 100) {
      newErrors.name = "習慣名は100文字以内にしてください";
    }

    if (frequency === "custom" && customDays.length === 0) {
      newErrors.customDays = "少なくとも1つの曜日を選択してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    startTransition(async () => {
      try {
        await onSubmit({
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          twoMinuteVersion: twoMinuteVersion.trim() || undefined,
          trigger: trigger.trim() || undefined,
          ifThenPlan: ifThenPlan.trim() || undefined,
          frequency,
          customDays: frequency === "custom" ? customDays : undefined,
          reminderTime: reminderTime || undefined,
          targetDays: targetDays ? parseInt(targetDays) : undefined,
        });
      } catch {
        setErrors({ submit: "送信に失敗しました。もう一度お試しください。" });
      }
    });
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 習慣名 */}
      <div className="space-y-2">
        <Label htmlFor="habit-name" className="text-base font-semibold">
          何をする？ <span className="text-destructive">*</span>
        </Label>
        <Input
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 朝の読書、ストレッチ、瞑想..."
          className="min-h-[44px]"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* 説明 */}
      <div className="space-y-2">
        <Label htmlFor="habit-description">説明（任意）</Label>
        <Textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="この習慣の目的や詳細..."
          rows={2}
          className="resize-none"
        />
      </div>

      {/* カテゴリ */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">カテゴリ</Label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                "flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                category === cat.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2分ルール */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            <Label
              htmlFor="two-minute"
              className="font-semibold text-blue-700 dark:text-blue-300"
            >
              2分バージョンは？
            </Label>
          </div>
          <p className="mb-2 text-xs text-blue-600 dark:text-blue-400">
            最初の一歩を超簡単に！2分で始められる形にしてみましょう。
          </p>
          <Input
            id="two-minute"
            value={twoMinuteVersion}
            onChange={(e) => setTwoMinuteVersion(e.target.value)}
            placeholder="例: エディタを開く、本を手に取る..."
            className="min-h-[44px] border-blue-200 bg-white dark:border-blue-800 dark:bg-background"
          />
        </CardContent>
      </Card>

      {/* 習慣スタッキング */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="trigger" className="font-semibold">
            いつやる？（習慣スタッキング）
          </Label>
        </div>
        <Input
          id="trigger"
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          placeholder="例: 朝コーヒーを入れた後に..."
          className="min-h-[44px]"
        />
      </div>

      {/* If-Then プラン */}
      <div className="space-y-2">
        <Label htmlFor="if-then" className="font-semibold">
          If-Then プラン
        </Label>
        <Textarea
          id="if-then"
          value={ifThenPlan}
          onChange={(e) => setIfThenPlan(e.target.value)}
          placeholder="もし [状況] になったら、[行動] をする"
          rows={2}
          className="resize-none"
        />
      </div>

      {/* 頻度 */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">頻度</Label>
        <div className="grid grid-cols-4 gap-2">
          {frequencies.map((freq) => (
            <button
              key={freq.value}
              type="button"
              onClick={() => setFrequency(freq.value)}
              className={cn(
                "min-h-[44px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                frequency === freq.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              {freq.label}
            </button>
          ))}
        </div>

        {frequency === "custom" && (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              実施する曜日を選択
            </p>
            <div className="flex gap-1.5">
              {dayLabels.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleCustomDay(index)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                    customDays.includes(index)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:bg-accent"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.customDays && (
              <p className="text-sm text-destructive">{errors.customDays}</p>
            )}
          </div>
        )}
      </div>

      {/* リマインダー */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="reminder" className="font-semibold">
            リマインダー時間
          </Label>
        </div>
        <Input
          id="reminder"
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="min-h-[44px]"
        />
      </div>

      {/* 目標期間 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="target-days" className="font-semibold">
            目標期間（日数）
          </Label>
        </div>
        <Input
          id="target-days"
          type="number"
          min="1"
          max="365"
          value={targetDays}
          onChange={(e) => setTargetDays(e.target.value)}
          placeholder="例: 30"
          className="min-h-[44px]"
        />
      </div>

      {/* エラー */}
      {errors.submit && (
        <p className="text-center text-sm text-destructive">{errors.submit}</p>
      )}

      {/* 送信ボタン */}
      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full min-h-[48px] text-base"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isEditing ? "更新中..." : "作成中..."}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
