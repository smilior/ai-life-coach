import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-debug-secret");
  if (secret !== process.env.E2E_TEST_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = getDb();
    const tables = await db.all(
      sql`SELECT name FROM sqlite_master WHERE type='table'`
    );
    const usersSchema = await db.all(
      sql`PRAGMA table_info(users)`
    );
    const accountsSchema = await db.all(
      sql`PRAGMA table_info(accounts)`
    );
    const sessionsSchema = await db.all(
      sql`PRAGMA table_info(sessions)`
    );
    return NextResponse.json({
      dbConnected: true,
      tables,
      usersSchema,
      accountsSchema,
      sessionsSchema,
      envCheck: {
        hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
        tursoUrlPrefix: process.env.TURSO_DATABASE_URL?.substring(0, 30),
      },
    });
  } catch (error) {
    return NextResponse.json({
      dbConnected: false,
      error: String(error),
    });
  }
}
