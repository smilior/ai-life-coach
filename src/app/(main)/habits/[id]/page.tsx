import { Metadata } from "next";
import { HabitDetailClient } from "./HabitDetailClient";

export const metadata: Metadata = {
  title: "習慣詳細 | AIライフコーチ",
  description: "習慣の詳細情報と履歴を確認できます。",
};

export const dynamic = "force-dynamic";

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HabitDetailClient habitId={id} />;
}
