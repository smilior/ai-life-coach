"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { HabitStreak } from "./HabitStreak";
import { CategoryBadge, type HabitCategory } from "./CategoryBadge";
import { ChevronRight, Clock } from "lucide-react";

interface HabitCardProps {
  id: string;
  name: string;
  description?: string | null;
  category: HabitCategory;
  currentStreak: number;
  completedToday: boolean;
  twoMinuteVersion?: string | null;
  reminderTime?: string | null;
  frequency: string;
  onCheck: (habitId: string) => Promise<void>;
}

const frequencyLabels: Record<string, string> = {
  daily: "毎日",
  weekdays: "平日",
  weekends: "週末",
  custom: "カスタム",
};

export function HabitCard({
  id,
  name,
  description,
  category,
  currentStreak,
  completedToday,
  twoMinuteVersion,
  reminderTime,
  frequency,
  onCheck,
}: HabitCardProps) {
  const [checked, setChecked] = useState(completedToday);
  const [isPending, startTransition] = useTransition();

  const handleCheck = () => {
    const newState = !checked;
    setChecked(newState);
    startTransition(async () => {
      try {
        await onCheck(id);
      } catch {
        setChecked(!newState);
      }
    });
  };

  return (
    <Card
      className={cn(
        "transition-all",
        checked && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
        isPending && "opacity-70"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            type="button"
            onClick={handleCheck}
            disabled={isPending}
            className="mt-0.5 flex h-[44px] w-[44px] shrink-0 items-center justify-center"
            aria-label={checked ? "習慣を未完了に戻す" : "習慣を完了する"}
          >
            <Checkbox
              checked={checked}
              tabIndex={-1}
              className="pointer-events-none h-5 w-5"
            />
          </button>

          {/* Content */}
          <Link
            href={`/habits/${id}`}
            className="flex min-w-0 flex-1 items-start justify-between gap-2"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-medium leading-tight",
                    checked && "text-muted-foreground line-through"
                  )}
                >
                  {name}
                </span>
              </div>

              {description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {description}
                </p>
              )}

              {twoMinuteVersion && !checked && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  2分版: {twoMinuteVersion}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={category} />
                {reminderTime && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {reminderTime}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {frequencyLabels[frequency] ?? frequency}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {currentStreak > 0 && (
                <HabitStreak currentStreak={currentStreak} />
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
