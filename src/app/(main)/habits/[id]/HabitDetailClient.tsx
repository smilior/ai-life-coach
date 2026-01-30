"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Target,
  ArrowRight,
  Loader2,
  Flame,
  Trophy,
  CalendarDays,
} from "lucide-react";
import { HabitStreak } from "@/components/features/habits/HabitStreak";
import { HabitCalendar } from "@/components/features/habits/HabitCalendar";
import {
  CategoryBadge,
  type HabitCategory,
} from "@/components/features/habits/CategoryBadge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

// ========================================
// Types
// ========================================

interface HabitDetail {
  id: string;
  name: string;
  description: string | null;
  category: string;
  twoMinuteVersion: string | null;
  trigger: string | null;
  ifThenPlan: string | null;
  frequency: string;
  isActive: boolean;
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  logs: Array<{
    id: string;
    completedAt: string;
    note: string | null;
    mood: number | null;
  }>;
  createdAt: string;
}

const frequencyLabels: Record<string, string> = {
  daily: "毎日",
  weekdays: "平日",
  weekends: "週末",
  custom: "カスタム",
};

// ========================================
// Component
// ========================================

export function HabitDetailClient({ habitId }: { habitId: string }) {
  const router = useRouter();
  const [habit, setHabit] = useState<HabitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchHabit = useCallback(async () => {
    try {
      const res = await fetch(`/api/habits/${habitId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch habit");
      }
      const data = await res.json();
      setHabit(data.data);
    } catch (err) {
      console.error("Failed to fetch habit:", err);
      setError("習慣の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    fetchHabit();
  }, [fetchHabit]);

  const handleCheck = useCallback(async () => {
    const res = await fetch(`/api/habits/${habitId}/check`, {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("Failed to toggle habit");
    }

    startTransition(() => {
      fetchHabit();
    });
  }, [habitId, fetchHabit]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete habit");
      }

      router.push("/habits");
      router.refresh();
    } catch {
      setError("削除に失敗しました");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  // Error
  if (error || !habit) {
    return (
      <div className="container mx-auto max-w-md px-4 py-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-4 text-muted-foreground">
            {error || "習慣が見つかりませんでした"}
          </p>
          <Button asChild>
            <Link href="/habits">習慣一覧に戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  const createdDate = new Date(habit.createdAt);
  const daysSinceCreation = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalLogs = habit.logs.length;

  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-[44px] w-[44px]"
          onClick={() => router.back()}
          aria-label="戻る"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-[44px] w-[44px]"
          >
            <Link href={`/habits/${habitId}/edit`} aria-label="編集">
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-[44px] w-[44px] text-destructive hover:text-destructive"
                aria-label="削除"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>習慣を削除</DialogTitle>
                <DialogDescription>
                  「{habit.name}」を削除しますか？
                  この操作は取り消せません。{totalLogs}件の記録も削除されます。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="min-h-[44px]"
                >
                  削除する
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteOpen(false)}
                  className="min-h-[44px]"
                >
                  キャンセル
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Habit info card */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-bold">{habit.name}</h1>
              {habit.description && (
                <p className="text-sm text-muted-foreground">
                  {habit.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleCheck}
              disabled={isPending}
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center"
              aria-label={
                habit.completedToday ? "習慣を未完了に戻す" : "習慣を完了する"
              }
            >
              <Checkbox
                checked={habit.completedToday}
                tabIndex={-1}
                className="pointer-events-none h-6 w-6"
              />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge
              category={(habit.category || "other") as HabitCategory}
            />
            <span className="text-xs text-muted-foreground">
              {frequencyLabels[habit.frequency] ?? habit.frequency}
            </span>
          </div>

          {habit.twoMinuteVersion && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                2分バージョン
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {habit.twoMinuteVersion}
              </p>
            </div>
          )}

          {habit.trigger && (
            <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{habit.trigger}</span>
            </div>
          )}

          {habit.ifThenPlan && (
            <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <Target className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{habit.ifThenPlan}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Flame
              className={cn(
                "mb-1 h-6 w-6",
                habit.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
              )}
            />
            <span className="text-xl font-bold">{habit.currentStreak}</span>
            <span className="text-xs text-muted-foreground">連続日数</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Trophy className="mb-1 h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold">{habit.bestStreak}</span>
            <span className="text-xs text-muted-foreground">最高記録</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <CalendarDays className="mb-1 h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">{totalLogs}</span>
            <span className="text-xs text-muted-foreground">達成回数</span>
          </CardContent>
        </Card>
      </div>

      {/* Streak info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ストリーク情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <HabitStreak
            currentStreak={habit.currentStreak}
            bestStreak={habit.bestStreak}
            showBest
            size="md"
          />
          <div className="text-sm text-muted-foreground">
            <p>
              開始日: {createdDate.toLocaleDateString("ja-JP")}
              （{daysSinceCreation}日前）
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <HabitCalendar logs={habit.logs} />
    </div>
  );
}
