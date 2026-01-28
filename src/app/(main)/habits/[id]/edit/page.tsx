import { Metadata } from "next";
import { EditHabitClient } from "./EditHabitClient";

export const metadata: Metadata = {
  title: "習慣を編集 | AIライフコーチ",
  description: "習慣の設定を変更できます。",
};

export const dynamic = "force-dynamic";

export default async function EditHabitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditHabitClient habitId={id} />;
}
