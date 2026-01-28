"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ValueQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLastQuestion: boolean;
  className?: string;
}

export function ValueQuestion({
  questionNumber,
  totalQuestions,
  question,
  placeholder,
  value,
  onChange,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  isLastQuestion,
  className,
}: ValueQuestionProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      {/* Question Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>質問 {questionNumber} / {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold leading-relaxed">
          {question}
        </h2>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[150px] resize-none text-base"
          autoFocus
        />
      </div>

      {/* Character Count */}
      <div className="text-right text-xs text-muted-foreground">
        {value.length} 文字
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={!canGoPrev}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex-1"
        >
          {isLastQuestion ? "完了" : "次へ"}
          {!isLastQuestion && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
