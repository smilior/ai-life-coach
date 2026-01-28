"use client";

import { Badge } from "@/components/ui/badge";
import {
  Heart,
  BookOpen,
  Briefcase,
  Home,
  MoreHorizontal,
} from "lucide-react";

export type HabitCategory =
  | "health"
  | "learning"
  | "work"
  | "life"
  | "other";

const categoryConfig: Record<
  HabitCategory,
  { label: string; icon: typeof Heart; className: string }
> = {
  health: {
    label: "健康",
    icon: Heart,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  learning: {
    label: "学習",
    icon: BookOpen,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  work: {
    label: "仕事",
    icon: Briefcase,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  life: {
    label: "生活",
    icon: Home,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  other: {
    label: "その他",
    icon: MoreHorizontal,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

interface CategoryBadgeProps {
  category: HabitCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category] ?? categoryConfig.other;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className ?? ""}`}
    >
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export function getCategoryLabel(category: HabitCategory): string {
  return categoryConfig[category]?.label ?? "その他";
}
