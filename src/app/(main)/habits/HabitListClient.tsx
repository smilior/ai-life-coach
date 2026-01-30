"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { HabitCard } from "@/components/features/habits/HabitCard";
import { HabitEmptyState } from "@/components/features/habits/HabitEmptyState";
import type { HabitCategory } from "@/components/features/habits/CategoryBadge";

// ========================================
// Types
// ========================================

interface HabitItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  twoMinuteVersion: string | null;
  frequency: string;
  currentStreak: number;
  bestStreak: number;
  isActive: boolean;
  completedToday: boolean;
}

// ========================================
// Component
// ========================================

export function HabitListClient() {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      if (!res.ok) {
        if (res.status === 401) {
          setHabits([]);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch habits");
      }
      const data = await res.json();
      setHabits(data.data ?? []);
    } catch (err) {
      console.error("Failed to fetch habits:", err);
      setError("習慣の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleCheck = useCallback(
    async (habitId: string) => {
      const res = await fetch(`/api/habits/${habitId}/check`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to toggle habit");
      }

      startTransition(() => {
        fetchHabits();
      });
    },
    [fetchHabits]
  );

  const activeHabits = habits.filter((h) => h.isActive);
  const completedCount = activeHabits.filter((h) => h.completedToday).length;
  const totalCount = activeHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-9 w-16" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-md px-4 py-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button onClick={() => { setError(null); setLoading(true); fetchHabits(); }}>
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (activeHabits.length === 0) {
    return (
      <div className="container mx-auto max-w-md px-4 py-6">
        <section className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">習慣管理</h1>
          <Button asChild size="sm" className="min-h-[44px]">
            <Link href="/habits/new">
              <Plus className="mr-1 h-4 w-4" />
              追加
            </Link>
          </Button>
        </section>
        <HabitEmptyState />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">今日の習慣</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} 完了
          </p>
        </div>
        <Button asChild size="sm" className="min-h-[44px]">
          <Link href="/habits/new">
            <Plus className="mr-1 h-4 w-4" />
            追加
          </Link>
        </Button>
      </section>

      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-2 flex justify-between text-sm">
                <span>今日の進捗</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Habit list */}
      <section className="space-y-3" aria-label="習慣リスト">
        {activeHabits.map((habit) => (
          <HabitCard
            key={habit.id}
            id={habit.id}
            name={habit.name}
            description={habit.description}
            category={(habit.category || "other") as HabitCategory}
            currentStreak={habit.currentStreak}
            completedToday={habit.completedToday}
            twoMinuteVersion={habit.twoMinuteVersion}
            frequency={habit.frequency}
            onCheck={handleCheck}
          />
        ))}
      </section>

      {/* FAB for mobile */}
      <Link
        href="/habits/new"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="新しい習慣を追加"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
