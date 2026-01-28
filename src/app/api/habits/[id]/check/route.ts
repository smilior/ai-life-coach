import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, habits, habitLogs, habitStreaks } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

// ========================================
// Helpers
// ========================================

async function getSession() {
  const auth = getAuth();
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isToday(dateStr: string): boolean {
  return dateStr.startsWith(getTodayDateString());
}

// ========================================
// POST: Toggle habit check for today
// ========================================

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: habitId } = await params;
    const db = getDb();

    // Verify ownership
    const habit = await db.query.habits.findFirst({
      where: and(
        eq(habits.id, habitId),
        eq(habits.userId, session.user.id)
      ),
    });

    if (!habit) {
      return NextResponse.json(
        { error: "Not Found", message: "Habit not found" },
        { status: 404 }
      );
    }

    const todayStr = getTodayDateString();
    const allLogs = await db.query.habitLogs.findMany({
      where: eq(habitLogs.habitId, habitId),
    });

    const todayLog = allLogs.find((log) => isToday(log.completedAt));

    if (todayLog) {
      // Uncheck
      await db.delete(habitLogs).where(eq(habitLogs.id, todayLog.id));

      const streak = await db.query.habitStreaks.findFirst({
        where: eq(habitStreaks.habitId, habitId),
      });

      if (streak) {
        const newStreak = Math.max(0, (streak.currentStreak ?? 0) - 1);
        await db
          .update(habitStreaks)
          .set({
            currentStreak: newStreak,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(habitStreaks.habitId, habitId));

        return NextResponse.json({
          success: true,
          data: { checked: false, streak: newStreak },
        });
      }

      return NextResponse.json({
        success: true,
        data: { checked: false, streak: 0 },
      });
    } else {
      // Check
      await db.insert(habitLogs).values({
        id: nanoid(),
        habitId,
        completedAt: new Date().toISOString(),
        note: null,
        mood: null,
      });

      const streak = await db.query.habitStreaks.findFirst({
        where: eq(habitStreaks.habitId, habitId),
      });

      if (streak) {
        const lastDate = streak.lastCompletedDate;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

        let newStreak: number;
        if (lastDate === yesterdayStr) {
          newStreak = (streak.currentStreak ?? 0) + 1;
        } else if (lastDate === todayStr) {
          newStreak = streak.currentStreak ?? 0;
        } else {
          newStreak = 1;
        }

        const newLongest = Math.max(streak.longestStreak ?? 0, newStreak);

        await db
          .update(habitStreaks)
          .set({
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastCompletedDate: todayStr,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(habitStreaks.habitId, habitId));

        return NextResponse.json({
          success: true,
          data: { checked: true, streak: newStreak },
        });
      } else {
        await db.insert(habitStreaks).values({
          id: nanoid(),
          habitId,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: todayStr,
          updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          data: { checked: true, streak: 1 },
        });
      }
    }
  } catch (error) {
    console.error("POST /api/habits/[id]/check error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to toggle habit check" },
      { status: 500 }
    );
  }
}
