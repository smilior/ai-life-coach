/**
 * 週間習慣進捗API
 * GET: 今週の日別習慣達成データを返す
 */

import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, habits, habitLogs } from "@/lib/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function getSession() {
  const auth = getAuth();
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 今週（月〜日）の日付リストを取得
 */
function getCurrentWeekDates(): { day: string; date: string; dayOfWeek: number }[] {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

  const days = ["月", "火", "水", "木", "金", "土", "日"];
  return days.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day,
      date: formatDate(d),
      dayOfWeek: i, // 0=月, 1=火, ..., 6=日
    };
  });
}

/**
 * 習慣がその曜日に該当するかチェック
 */
function isHabitScheduledForDay(frequency: string, dayOfWeek: number): boolean {
  switch (frequency) {
    case "daily":
      return true;
    case "weekdays":
      return dayOfWeek <= 4; // 月〜金
    case "weekends":
      return dayOfWeek >= 5; // 土〜日
    default:
      return true; // custom/unknown → 全日
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getDb();
    const weekDates = getCurrentWeekDates();
    const weekStart = weekDates[0].date;
    const weekEnd = weekDates[6].date;

    // ユーザーの全アクティブ習慣を取得
    const userHabits = await db.query.habits.findMany({
      where: and(
        eq(habits.userId, session.user.id),
        eq(habits.isActive, true)
      ),
    });

    if (userHabits.length === 0) {
      return NextResponse.json({
        success: true,
        data: weekDates.map((wd) => ({
          day: wd.day,
          completed: 0,
          total: 0,
        })),
      });
    }

    // 今週のログを全習慣分一括取得
    const habitIds = userHabits.map((h) => h.id);
    const allLogs: (typeof habitLogs.$inferSelect)[] = [];

    for (const hId of habitIds) {
      const logs = await db.query.habitLogs.findMany({
        where: and(
          eq(habitLogs.habitId, hId),
          gte(habitLogs.completedAt, weekStart),
          lte(habitLogs.completedAt, weekEnd + "T23:59:59Z")
        ),
      });
      allLogs.push(...logs);
    }

    // 日別の進捗を計算
    const weeklyData = weekDates.map((wd) => {
      const scheduledHabits = userHabits.filter((h) =>
        isHabitScheduledForDay(h.frequency ?? "daily", wd.dayOfWeek)
      );

      const completedHabits = new Set<string>();
      for (const log of allLogs) {
        if (log.completedAt.startsWith(wd.date)) {
          completedHabits.add(log.habitId);
        }
      }

      return {
        day: wd.day,
        completed: completedHabits.size,
        total: scheduledHabits.length,
      };
    });

    return NextResponse.json({ success: true, data: weeklyData });
  } catch (error) {
    console.error("GET /api/habits/weekly error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch weekly data" },
      { status: 500 }
    );
  }
}
