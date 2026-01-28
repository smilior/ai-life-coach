import { Metadata } from "next";
import { ProgressContent } from "./ProgressContent";

export const metadata: Metadata = {
  title: "進捗 | AIライフコーチ",
  description: "あなたの成長と達成を確認しましょう。",
};

export default function ProgressPage() {
  return <ProgressContent />;
}
