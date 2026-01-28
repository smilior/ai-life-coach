"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, PartyPopper } from "lucide-react";

export interface HabitItem {
  id: string;
  name: string;
  twoMinVersion: string;
  completed: boolean;
  streak: number;
}

interface TodayHabitsProps {
  habits?: HabitItem[];
  onToggle?: (id: string, completed: boolean) => void;
}

const mockHabits: HabitItem[] = [
  {
    id: "1",
    name: "朝の瞑想",
    twoMinVersion: "深呼吸3回",
    completed: true,
    streak: 12,
  },
  {
    id: "2",
    name: "読書",
    twoMinVersion: "1ページ読む",
    completed: false,
    streak: 5,
  },
  {
    id: "3",
    name: "運動",
    twoMinVersion: "ストレッチ2分",
    completed: false,
    streak: 3,
  },
  {
    id: "4",
    name: "日記を書く",
    twoMinVersion: "1行だけ書く",
    completed: false,
    streak: 7,
  },
];

export function TodayHabits({
  habits: initialHabits,
  onToggle,
}: TodayHabitsProps) {
  const [habits, setHabits] = useState<HabitItem[]>(
    initialHabits ?? mockHabits
  );

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  const handleToggle = useCallback(
    (id: string) => {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, completed: !h.completed } : h
        )
      );
      const habit = habits.find((h) => h.id === id);
      if (habit && onToggle) {
        onToggle(id, !habit.completed);
      }
    },
    [habits, onToggle]
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">今日の習慣</h2>
        <Badge variant={allCompleted ? "success" : "outline"}>
          {completedCount}/{totalCount} 完了
        </Badge>
      </div>

      {/* プログレスバー */}
      <div className="space-y-1.5">
        <Progress value={progressPercent} className="h-2.5" />
        <p className="text-xs text-muted-foreground text-right">
          達成率 {Math.round(progressPercent)}%
        </p>
      </div>

      {/* 全完了時のお祝い */}
      {allCompleted && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <PartyPopper className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">
                素晴らしい! 今日の習慣をすべて達成しました!
              </p>
              <p className="text-sm text-green-600/80 dark:text-green-400/80">
                この調子で明日も頑張りましょう
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 習慣リスト */}
      <div className="space-y-2">
        {habits.map((habit) => (
          <Card
            key={habit.id}
            className={
              habit.completed
                ? "border-green-200/50 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20"
                : ""
            }
          >
            <CardContent className="p-4">
              <button
                type="button"
                className="flex w-full items-start gap-3 text-left"
                onClick={() => handleToggle(habit.id)}
              >
                <Checkbox
                  checked={habit.completed}
                  className="mt-0.5 h-5 w-5"
                  onCheckedChange={() => handleToggle(habit.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      habit.completed
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {habit.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    2分版: {habit.twoMinVersion}
                  </p>
                </div>
                {habit.streak > 0 && (
                  <div className="flex shrink-0 items-center gap-1 text-xs text-orange-500">
                    <Flame className="h-3.5 w-3.5" />
                    <span>{habit.streak}日</span>
                  </div>
                )}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
