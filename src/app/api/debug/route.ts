import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-debug-secret");
  if (secret !== process.env.E2E_TEST_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const action = new URL(request.url).searchParams.get("action");

  try {
    const db = getDb();

    if (action === "test-insert") {
      // Test inserting a user directly
      const testId = `test-${Date.now()}`;
      await db.run(
        sql`INSERT INTO users (id, name, email, created_at, updated_at) VALUES (${testId}, 'Test', ${`test-${Date.now()}@test.com`}, datetime('now'), datetime('now'))`
      );
      // Clean up
      await db.run(sql`DELETE FROM users WHERE id = ${testId}`);
      return NextResponse.json({ insertTest: "success" });
    }

    if (action === "test-signup") {
      // Try to call Better Auth sign-up directly
      const { getAuth } = await import("@/lib/auth");
      const auth = getAuth();
      // Create a mock request
      const signupUrl = new URL("/api/auth/sign-up/email", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
      const mockReq = new Request(signupUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
        body: JSON.stringify({
          email: `debug-${Date.now()}@test.com`,
          password: "TestPassword123!",
          name: "DebugTest",
        }),
      });
      const { toNextJsHandler } = await import("better-auth/next-js");
      const handler = toNextJsHandler(auth);
      const res = await handler.POST(mockReq);
      const body = await res.text();
      return NextResponse.json({
        signupStatus: res.status,
        signupHeaders: Object.fromEntries(res.headers.entries()),
        signupBody: body,
      });
    }

    const tables = await db.all(
      sql`SELECT name FROM sqlite_master WHERE type='table'`
    );
    return NextResponse.json({
      dbConnected: true,
      tables,
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
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
