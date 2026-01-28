import { Metadata } from "next";
import { NewHabitClient } from "./NewHabitClient";

export const metadata: Metadata = {
  title: "新しい習慣 | AIライフコーチ",
  description: "新しい習慣を作成して、理想の自分に近づきましょう。",
};

export default function NewHabitPage() {
  return <NewHabitClient />;
}
