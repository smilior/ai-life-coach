"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { HabitForm, type HabitFormData } from "@/components/features/habits";
import type { HabitCategory } from "@/components/features/habits/CategoryBadge";

// ========================================
// Types
// ========================================

interface HabitData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  twoMinuteVersion: string | null;
  trigger: string | null;
  ifThenPlan: string | null;
  frequency: string;
  isActive: boolean;
}

// ========================================
// Component
// ========================================

export function EditHabitClient({ habitId }: { habitId: string }) {
  const router = useRouter();
  const [habit, setHabit] = useState<HabitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchHabit = useCallback(async () => {
    try {
      const res = await fetch(`/api/habits/${habitId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch habit");
      }
      const data = await res.json();
      setHabit(data.data);
    } catch (err) {
      console.error("Failed to fetch habit:", err);
      setError("習慣の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    fetchHabit();
  }, [fetchHabit]);

  const handleSubmit = async (data: HabitFormData) => {
    const res = await fetch(`/api/habits/${habitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update habit");
    }

    router.push(`/habits/${habitId}`);
    router.refresh();
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete habit");
      }

      router.push("/habits");
      router.refresh();
    } catch {
      setError("削除に失敗しました");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !habit) {
    return (
      <div className="container mx-auto max-w-md px-4 py-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-4 text-muted-foreground">
            {error || "習慣が見つかりませんでした"}
          </p>
          <Button asChild>
            <Link href="/habits">習慣一覧に戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  const initialData: Partial<HabitFormData> = {
    name: habit.name,
    description: habit.description ?? undefined,
    category: (habit.category || "other") as HabitCategory,
    twoMinuteVersion: habit.twoMinuteVersion ?? undefined,
    trigger: habit.trigger ?? undefined,
    ifThenPlan: habit.ifThenPlan ?? undefined,
    frequency: (habit.frequency ?? "daily") as HabitFormData["frequency"],
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-[44px] w-[44px]"
          onClick={() => router.back()}
          aria-label="戻る"
        >
          <X className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">習慣を編集</h1>
        <div className="w-[44px]" />
      </div>

      {/* Form */}
      <HabitForm
        initialData={initialData}
        onSubmit={handleSubmit}
        submitLabel="変更を保存"
        isEditing
      />

      {/* Delete section */}
      <div className="mt-8">
        <Separator className="mb-6" />
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full min-h-[44px] text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              この習慣を削除
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>習慣を削除</DialogTitle>
              <DialogDescription>
                「{habit.name}
                」を削除しますか？この操作は取り消せません。記録も全て削除されます。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="min-h-[44px]"
              >
                削除する
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="min-h-[44px]"
              >
                キャンセル
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
