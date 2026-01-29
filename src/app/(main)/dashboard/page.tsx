import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getDb, userProfiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = {
  title: "ダッシュボード | AIライフコーチ",
  description: "今日のあなたの進捗を確認しましょう。",
};

export default async function DashboardPage() {
  const auth = getAuth();
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user) {
    redirect("/login");
  }

  // オンボーディング完了チェック
  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <DashboardContent userName={session.user.name} />;
}
