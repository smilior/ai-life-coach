import { Metadata } from "next";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "ダッシュボード | AIライフコーチ",
  description: "今日のあなたの進捗を確認しましょう。",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
