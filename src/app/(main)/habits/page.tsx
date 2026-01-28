import { Metadata } from "next";
import { HabitListClient } from "./HabitListClient";

export const metadata: Metadata = {
  title: "習慣 | AIライフコーチ",
  description: "日々の習慣を管理して、理想の自分に近づきましょう。",
};

export const dynamic = "force-dynamic";

export default function HabitsPage() {
  return <HabitListClient />;
}
