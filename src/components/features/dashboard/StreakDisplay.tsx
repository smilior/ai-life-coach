"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  currentStreak?: number;
  bestStreak?: number;
}

const MOCK_STREAK = {
  currentStreak: 5,
  bestStreak: 12,
};

export function StreakDisplay({
  currentStreak = MOCK_STREAK.currentStreak,
  bestStreak = MOCK_STREAK.bestStreak,
}: StreakDisplayProps) {
  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-900 dark:from-orange-950/30 dark:to-amber-950/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-orange-600 dark:text-orange-400">
                {currentStreak}
              </span>
              <span className="text-sm font-medium text-orange-600/80 dark:text-orange-400/80">
                日
              </span>
            </div>
            <p className="text-sm font-medium text-orange-700/80 dark:text-orange-300/80">
              連続{currentStreak}日達成中!
            </p>
          </div>
          <Badge variant="streak" className="shrink-0">
            最長 {bestStreak}日
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
