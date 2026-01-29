import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * テスト用プロフィール作成API
 * NODE_ENV === 'production' では無効
 * 認証はBetter Authの /api/auth/sign-up/email を使用し、
 * このエンドポイントはプロフィール作成のみ担当
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const email = body.email;

  if (!email) {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }

  const db = getDb();

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found. Sign up first." },
      { status: 404 }
    );
  }

  // プロフィール作成（オンボーディング完了状態）
  const existingProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!existingProfile) {
    await db.insert(userProfiles).values({
      id: crypto.randomUUID(),
      userId: user.id,
      purpose: "performance",
      values: JSON.stringify(["成長", "挑戦", "貢献"]),
      motivation: "テスト用モチベーション",
      onboardingCompleted: true,
    });
  }

  return NextResponse.json({ success: true, userId: user.id });
}
