"use client";

import { Progress } from "@/components/ui/progress";
import { ONBOARDING_STEPS } from "./OnboardingContext";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  className?: string;
}

export function OnboardingProgress({
  currentStep,
  className,
}: OnboardingProgressProps) {
  const totalSteps = ONBOARDING_STEPS.length;
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      <Progress value={progressValue} className="h-1" />
      <div className="mt-3 flex items-center justify-between px-2">
        {ONBOARDING_STEPS.map((step, index) => (
          <div
            key={step.id}
            className="flex flex-col items-center"
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all",
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "mt-1 hidden text-xs sm:block",
                index === currentStep
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface OnboardingProgressSimpleProps {
  currentStep: number;
  totalSteps?: number;
  className?: string;
}

export function OnboardingProgressSimple({
  currentStep,
  totalSteps = ONBOARDING_STEPS.length,
  className,
}: OnboardingProgressSimpleProps) {
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      <Progress value={progressValue} className="h-1" />
      <p className="mt-2 text-center text-xs text-muted-foreground">
        ステップ {currentStep + 1} / {totalSteps}
      </p>
    </div>
  );
}
