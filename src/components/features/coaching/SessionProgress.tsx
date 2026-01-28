"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { COACHING_STEP_INFO, type CoachingStep } from "@/types/ai";

interface SessionProgressProps {
  currentStep: CoachingStep;
  className?: string;
}

/**
 * 解決志向9ステップの進捗表示コンポーネント
 * - 現在のステップ名とステップ番号を Badge で表示
 * - 9ステップ中の進捗をプログレスバーで表示
 */
export function SessionProgress({
  currentStep,
  className,
}: SessionProgressProps) {
  const stepInfo = COACHING_STEP_INFO[currentStep];
  const progressValue = (currentStep / 9) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="secondary" className="shrink-0 text-xs">
            Step {currentStep}/9
          </Badge>
          <span className="text-sm font-medium truncate">
            {stepInfo.name}
          </span>
        </div>
      </div>
      <Progress value={progressValue} className="h-1.5" />
    </div>
  );
}

interface SessionProgressCompactProps {
  currentStep: CoachingStep;
  className?: string;
}

/**
 * コンパクト版の進捗表示（ヘッダー内用）
 */
export function SessionProgressCompact({
  currentStep,
  className,
}: SessionProgressCompactProps) {
  const stepInfo = COACHING_STEP_INFO[currentStep];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
        {currentStep}/9
      </Badge>
      <span className="text-xs text-muted-foreground truncate">
        {stepInfo.name}
      </span>
    </div>
  );
}
