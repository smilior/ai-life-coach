"use client";

import {
  Greeting,
  StreakDisplay,
  TodayHabits,
  DailyCheckin,
  WeeklyProgress,
} from "@/components/features/dashboard";

interface DashboardContentProps {
  userName?: string | null;
}

export function DashboardContent({ userName }: DashboardContentProps) {
  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* 1. グリーティングセクション */}
      <Greeting nickname={userName ?? "ユーザー"} />

      {/* 2. ストリーク表示セクション */}
      <StreakDisplay />

      {/* 3. 今日の習慣チェックリスト */}
      <TodayHabits />

      {/* 4. デイリーチェックインカード */}
      <DailyCheckin />

      {/* 5. 週間進捗サマリー */}
      <WeeklyProgress />
    </div>
  );
}
