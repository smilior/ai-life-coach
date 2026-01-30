"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { HabitForm, type HabitFormData } from "@/components/features/habits";

function NewHabitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (data: HabitFormData) => {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create habit");
    }

    router.push("/habits");
    router.refresh();
  };

  const initialData: Partial<HabitFormData> = {};
  const name = searchParams.get("name");
  const description = searchParams.get("description");
  const twoMinuteVersion = searchParams.get("twoMinuteVersion");
  if (name) initialData.name = name;
  if (description) initialData.description = description;
  if (twoMinuteVersion) initialData.twoMinuteVersion = twoMinuteVersion;

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
        <h1 className="text-lg font-bold">新しい習慣</h1>
        <div className="w-[44px]" /> {/* Spacer */}
      </div>

      {/* Form */}
      <HabitForm
        onSubmit={handleSubmit}
        submitLabel="習慣を作成"
        initialData={Object.keys(initialData).length > 0 ? initialData : undefined}
      />
    </div>
  );
}

export function NewHabitClient() {
  return (
    <Suspense>
      <NewHabitForm />
    </Suspense>
  );
}
