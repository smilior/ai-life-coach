"use client";

import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitStreakProps {
  currentStreak: number;
  bestStreak?: number;
  showBest?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function HabitStreak({
  currentStreak,
  bestStreak,
  showBest = false,
  size = "sm",
  className,
}: HabitStreakProps) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center gap-1 text-muted-foreground",
          sizeClasses[size],
          currentStreak >= 7 && "text-orange-500",
          currentStreak >= 30 && "text-red-500"
        )}
      >
        <Flame
          className={cn(
            iconSizes[size],
            currentStreak >= 7 && "text-orange-500",
            currentStreak >= 30 && "text-red-500",
            currentStreak > 0 && currentStreak < 7 && "text-amber-500"
          )}
        />
        <span className="font-medium">{currentStreak}日</span>
      </div>

      {showBest && bestStreak !== undefined && bestStreak > 0 && (
        <div
          className={cn(
            "flex items-center gap-1 text-muted-foreground",
            sizeClasses[size]
          )}
        >
          <Trophy className={cn(iconSizes[size], "text-yellow-500")} />
          <span>最高 {bestStreak}日</span>
        </div>
      )}
    </div>
  );
}
