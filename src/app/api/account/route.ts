/**
 * アカウント管理API
 * DELETE: アカウントと関連データの完全削除
 */

import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function getSession() {
  const auth = getAuth();
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

/**
 * DELETE: アカウント削除
 * usersテーブルから削除すると、CASCADE設定により
 * sessions, accounts, user_profiles, coaching_sessions,
 * coaching_messages, habits, habit_logs, habit_streaks,
 * user_badges が全て連鎖削除される
 */
export async function DELETE() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getDb();

    await db.delete(users).where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/account error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete account" },
      { status: 500 }
    );
  }
}
