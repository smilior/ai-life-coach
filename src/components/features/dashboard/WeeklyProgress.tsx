"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DayProgress {
  day: string;
  completed: number;
  total: number;
}

interface WeeklyProgressProps {
  weekData?: DayProgress[];
}

function getDotColor(completed: number, total: number): string {
  if (total === 0) return "bg-muted";
  const rate = completed / total;
  if (rate === 1) return "bg-green-500";
  if (rate >= 0.5) return "bg-yellow-500";
  if (rate > 0) return "bg-orange-400";
  return "bg-muted";
}

function isToday(dayIndex: number): boolean {
  const now = new Date();
  // JavaScript getDay: 0=日, 1=月, ... 6=土
  // Our array: 0=月, 1=火, ... 6=日
  const jsDay = now.getDay();
  const mappedIndex = jsDay === 0 ? 6 : jsDay - 1;
  return dayIndex === mappedIndex;
}

export function WeeklyProgress({ weekData }: WeeklyProgressProps) {
  const data = weekData ?? [];

  const totalCompleted = data.reduce((acc, d) => acc + d.completed, 0);
  const totalTasks = data.reduce((acc, d) => acc + d.total, 0);
  const weeklyRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">週間進捗</h2>
        <Badge variant={weeklyRate >= 70 ? "success" : "outline"}>
          {weeklyRate}%
        </Badge>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              今週のデータはまだありません
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-end justify-between gap-1">
              {data.map((d, i) => {
                const today = isToday(i);
                const rate = d.total > 0 ? d.completed / d.total : 0;
                return (
                  <div
                    key={d.day}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    {/* ドットまたはバー表示 */}
                    <div className="flex flex-col items-center gap-1">
                      {d.total > 0 ? (
                        Array.from({ length: d.total }).map((_, dotIdx) => (
                          <div
                            key={dotIdx}
                            className={`h-2.5 w-2.5 rounded-full transition-colors ${
                              dotIdx < d.completed
                                ? getDotColor(d.completed, d.total)
                                : "bg-muted"
                            }`}
                          />
                        ))
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                      )}
                    </div>
                    {/* 曜日ラベル */}
                    <span
                      className={`text-xs ${
                        today
                          ? "font-bold text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {d.day}
                    </span>
                    {/* 達成率テキスト */}
                    <span className="text-[10px] text-muted-foreground">
                      {d.completed}/{d.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
