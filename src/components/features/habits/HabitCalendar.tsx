"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface HabitCalendarProps {
  logs: Array<{ completedAt: string }>;
  className?: string;
}

export function HabitCalendar({ logs, className }: HabitCalendarProps) {
  const completedDates = useMemo(() => {
    return logs.map((log) => {
      const date = new Date(log.completedAt);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
  }, [logs]);

  const today = new Date();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">完了カレンダー</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center px-2 pb-4">
        <Calendar
          mode="multiple"
          selected={completedDates}
          defaultMonth={today}
          className="rounded-md"
          disabled={{ after: today }}
        />
      </CardContent>
    </Card>
  );
}
