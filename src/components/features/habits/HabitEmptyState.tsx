"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListTodo, Plus, Lightbulb } from "lucide-react";

export function HabitEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <ListTodo className="h-10 w-10 text-muted-foreground" />
      </div>

      <h2 className="mb-2 text-lg font-semibold">まだ習慣がありません</h2>

      <p className="mb-6 max-w-xs text-sm text-muted-foreground">
        小さな習慣から始めて、大きな変化を起こしましょう
      </p>

      <Button asChild size="lg" className="min-h-[44px]">
        <Link href="/habits/new">
          <Plus className="mr-2 h-5 w-5" />
          最初の習慣を作成
        </Link>
      </Button>

      <div className="mt-6 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-left">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs text-muted-foreground">
          ヒント: 2分でできる小さな習慣がおすすめです。
          まずは「本を1ページ読む」のような簡単なことから始めましょう。
        </p>
      </div>
    </div>
  );
}
