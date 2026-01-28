"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface PurposeCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function PurposeCard({
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  isSelected,
  onSelect,
}: PurposeCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:border-primary hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected && "border-primary bg-primary/5 shadow-md"
      )}
    >
      <CardContent className="relative flex items-center gap-4 p-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all",
            bgColor,
            isSelected && "scale-110"
          )}
        >
          <Icon className={cn("h-6 w-6", color)} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {isSelected && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
