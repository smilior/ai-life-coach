"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Greeting,
  StreakDisplay,
  TodayHabits,
  DailyCheckin,
  WeeklyProgress,
} from "@/components/features/dashboard";
import { Loader2 } from "lucide-react";

interface DashboardContentProps {
  userName?: string | null;
}

interface HabitApiData {
  id: string;
  name: string;
  twoMinuteVersion: string | null;
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  frequency: string;
}

interface DayProgress {
  day: string;
  completed: number;
  total: number;
}

export function DashboardContent({ userName }: DashboardContentProps) {
  const [habits, setHabits] = useState<HabitApiData[]>([]);
  const [weekData, setWeekData] = useState<DayProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // データ取得
  useEffect(() => {
    async function fetchData() {
      try {
        const [habitsRes, weeklyRes] = await Promise.all([
          fetch("/api/habits"),
          fetch("/api/habits/weekly"),
        ]);

        const habitsJson = await habitsRes.json();
        if (habitsJson.success) {
          setHabits(habitsJson.data);
        }

        const weeklyJson = await weeklyRes.json();
        if (weeklyJson.success) {
          setWeekData(weeklyJson.data);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // 習慣チェックトグル
  const handleToggle = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/habits/${id}/check`, {
          method: "POST",
        });
        const json = await res.json();
        if (json.success) {
          setHabits((prev) =>
            prev.map((h) =>
              h.id === id
                ? {
                    ...h,
                    completedToday: json.data.checked,
                    currentStreak: json.data.streak,
                  }
                : h
            )
          );
        }
      } catch (e) {
        console.error("Failed to toggle habit:", e);
      }
    },
    []
  );

  // TodayHabits用のデータ変換
  const habitItems = habits.map((h) => ({
    id: h.id,
    name: h.name,
    twoMinVersion: h.twoMinuteVersion ?? "",
    completed: h.completedToday,
    streak: h.currentStreak,
  }));

  // ストリーク集計
  const currentStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;
  const bestStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.bestStreak)) : 0;

  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* 1. グリーティングセクション */}
      <Greeting nickname={userName ?? "ユーザー"} />

      {/* 2. ストリーク表示セクション */}
      <StreakDisplay currentStreak={currentStreak} bestStreak={bestStreak} />

      {/* 3. 今日の習慣チェックリスト */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            読み込み中...
          </span>
        </div>
      ) : (
        <TodayHabits habits={habitItems} onToggle={handleToggle} />
      )}

      {/* 4. デイリーチェックインカード */}
      <DailyCheckin />

      {/* 5. 週間進捗サマリー */}
      <WeeklyProgress weekData={weekData} />
    </div>
  );
}
