"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Flame,
  Trophy,
  Target,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

// --- Mock Data ---

interface HabitStat {
  name: string;
  completionRate: number;
  totalCompleted: number;
}

interface DayRecord {
  date: number;
  completedAll: boolean;
  completedSome: boolean;
}

interface StreakPoint {
  week: string;
  streak: number;
}

const mockStats = {
  currentStreak: 5,
  bestStreak: 23,
  totalCompleted: 156,
  overallRate: 87,
  totalHabits: 4,
};

const mockWeeklyStats = [
  { day: "月", completed: 4, total: 4 },
  { day: "火", completed: 3, total: 4 },
  { day: "水", completed: 4, total: 4 },
  { day: "木", completed: 2, total: 4 },
  { day: "金", completed: 4, total: 4 },
  { day: "土", completed: 3, total: 4 },
  { day: "日", completed: 0, total: 4 },
];

const mockHabitStats: HabitStat[] = [
  { name: "朝の瞑想", completionRate: 92, totalCompleted: 45 },
  { name: "読書", completionRate: 85, totalCompleted: 38 },
  { name: "運動", completionRate: 70, totalCompleted: 32 },
  { name: "日記を書く", completionRate: 78, totalCompleted: 41 },
];

const mockStreakTrend: StreakPoint[] = [
  { week: "4週前", streak: 3 },
  { week: "3週前", streak: 7 },
  { week: "2週前", streak: 12 },
  { week: "先週", streak: 5 },
  { week: "今週", streak: 5 },
];

function generateCalendarData(year: number, month: number): DayRecord[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const records: DayRecord[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isPast = date < today;
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    if (isPast || isToday) {
      const rand = Math.random();
      records.push({
        date: d,
        completedAll: rand > 0.3,
        completedSome: rand > 0.1,
      });
    } else {
      records.push({
        date: d,
        completedAll: false,
        completedSome: false,
      });
    }
  }
  return records;
}

// --- Components ---

function StatsSummary() {
  return (
    <section className="space-y-3">
      {/* メインストリーク */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-900 dark:from-orange-950/30 dark:to-amber-950/30">
        <CardContent className="p-5 text-center">
          <Flame className="mx-auto mb-2 h-10 w-10 text-orange-500" />
          <p className="text-5xl font-extrabold text-orange-600 dark:text-orange-400">
            {mockStats.bestStreak}
          </p>
          <p className="mt-1 text-sm font-medium text-orange-700/80 dark:text-orange-300/80">
            最長ストリーク
          </p>
        </CardContent>
      </Card>

      {/* KPIグリッド */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Target className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="text-xl font-bold">{mockStats.overallRate}%</p>
            <p className="text-[10px] text-muted-foreground">達成率</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-500" />
            <p className="text-xl font-bold">{mockStats.totalCompleted}</p>
            <p className="text-[10px] text-muted-foreground">完了回数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="mx-auto mb-1 h-5 w-5 text-amber-500" />
            <p className="text-xl font-bold">{mockStats.totalHabits}</p>
            <p className="text-[10px] text-muted-foreground">習慣数</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function WeeklyChart() {
  const totalCompleted = mockWeeklyStats.reduce(
    (acc, d) => acc + d.completed,
    0
  );
  const totalTasks = mockWeeklyStats.reduce((acc, d) => acc + d.total, 0);
  const weeklyRate =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">今週の達成状況</CardTitle>
          <Badge variant={weeklyRate >= 70 ? "success" : "outline"}>
            {weeklyRate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          {mockWeeklyStats.map((stat) => {
            const rate =
              stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
            return (
              <div
                key={stat.day}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-20 w-8 flex-col justify-end overflow-hidden rounded-md bg-muted">
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      rate === 100
                        ? "bg-green-500"
                        : rate >= 50
                          ? "bg-yellow-500"
                          : rate > 0
                            ? "bg-orange-400"
                            : "bg-transparent"
                    }`}
                    style={{
                      height: `${rate}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {stat.day}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function HabitBreakdown() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">習慣別の達成率</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockHabitStats.map((habit) => (
          <div key={habit.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{habit.name}</span>
              <span className="text-muted-foreground">
                {habit.completionRate}%
              </span>
            </div>
            <Progress value={habit.completionRate} className="h-2.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarData = useMemo(
    () => generateCalendarData(year, month),
    [year, month]
  );

  const today = new Date();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();
  const todayDate = today.getDate();

  // Calculate calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthLabel = `${year}年${month + 1}月`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-base">{monthLabel}</CardTitle>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* 曜日ヘッダー */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {weekdays.map((wd) => (
            <span
              key={wd}
              className="text-xs font-medium text-muted-foreground"
            >
              {wd}
            </span>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {/* 空白セル（月初の曜日オフセット） */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9" />
          ))}

          {/* 日付セル */}
          {calendarData.map((record) => {
            const isTodayCell = isCurrentMonth && record.date === todayDate;
            const isPast =
              new Date(year, month, record.date) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isFuture = !isPast && !isTodayCell;

            let dotColor = "bg-muted";
            if (isTodayCell) {
              dotColor = "bg-blue-500";
            } else if (record.completedAll && isPast) {
              dotColor = "bg-green-500";
            } else if (record.completedSome && isPast) {
              dotColor = "bg-yellow-500";
            } else if (isFuture) {
              dotColor = "bg-transparent";
            }

            return (
              <div
                key={record.date}
                className="flex h-9 flex-col items-center justify-center gap-0.5"
              >
                <span
                  className={`text-xs ${
                    isTodayCell
                      ? "font-bold text-blue-600 dark:text-blue-400"
                      : isFuture
                        ? "text-muted-foreground/40"
                        : "text-foreground"
                  }`}
                >
                  {record.date}
                </span>
                <div className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
              </div>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            全達成
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
            一部
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            今日
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function StreakTrend() {
  const maxStreak = Math.max(...mockStreakTrend.map((p) => p.streak));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">ストリーク推移</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          {mockStreakTrend.map((point) => {
            const heightPercent =
              maxStreak > 0 ? (point.streak / maxStreak) * 100 : 0;
            return (
              <div
                key={point.week}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-xs font-medium text-foreground">
                  {point.streak}
                </span>
                <div className="flex h-16 w-full items-end justify-center">
                  <div
                    className="w-full max-w-6 rounded-t-sm bg-primary/70 transition-all"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {point.week}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Content ---

export function ProgressContent() {
  return (
    <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
      {/* ヘッダー */}
      <section>
        <h1 className="text-2xl font-bold">進捗・統計</h1>
        <p className="text-sm text-muted-foreground">
          あなたの成長を振り返りましょう
        </p>
      </section>

      {/* 統計サマリー */}
      <StatsSummary />

      {/* 今週の達成状況 */}
      <WeeklyChart />

      {/* 習慣別の達成率 */}
      <HabitBreakdown />

      {/* カレンダービュー */}
      <CalendarView />

      {/* ストリーク推移 */}
      <StreakTrend />
    </div>
  );
}
