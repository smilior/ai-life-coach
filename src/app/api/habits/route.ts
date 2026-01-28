import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, habits, habitStreaks, habitLogs } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

// ========================================
// Validation
// ========================================

const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["health", "learning", "work", "life", "other"]),
  twoMinuteVersion: z.string().max(200).optional(),
  trigger: z.string().max(200).optional(),
  ifThenPlan: z.string().max(500).optional(),
  frequency: z.enum(["daily", "weekdays", "weekends", "custom"]),
  customDays: z.array(z.number().min(0).max(6)).optional(),
  reminderTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  targetDays: z.number().min(1).max(365).optional(),
});

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
// GET: Get all habits
// ========================================

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

    const userHabits = await db.query.habits.findMany({
      where: eq(habits.userId, session.user.id),
      orderBy: [habits.order],
    });

    const habitsWithDetails = await Promise.all(
      userHabits.map(async (habit) => {
        const streak = await db.query.habitStreaks.findFirst({
          where: eq(habitStreaks.habitId, habit.id),
        });

        const logs = await db.query.habitLogs.findMany({
          where: eq(habitLogs.habitId, habit.id),
          orderBy: [desc(habitLogs.completedAt)],
        });

        const completedToday = logs.some((log) => isToday(log.completedAt));

        return {
          id: habit.id,
          userId: habit.userId,
          name: habit.name,
          description: habit.description,
          twoMinuteVersion: habit.twoMinuteVersion,
          trigger: habit.trigger,
          ifThenPlan: habit.ifThenPlan,
          frequency: habit.frequency ?? "daily",
          reminderTime: habit.reminderTime,
          isActive: habit.isActive ?? true,
          currentStreak: streak?.currentStreak ?? 0,
          bestStreak: streak?.longestStreak ?? 0,
          completedToday,
          createdAt: habit.createdAt,
          updatedAt: habit.updatedAt,
        };
      })
    );

    return NextResponse.json({ success: true, data: habitsWithDetails });
  } catch (error) {
    console.error("GET /api/habits error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

// ========================================
// POST: Create new habit
// ========================================

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = createHabitSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid request body",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = getDb();

    const now = new Date().toISOString();
    const habitId = nanoid();

    const newHabit = {
      id: habitId,
      userId: session.user.id,
      name: data.name,
      description: data.description ?? null,
      twoMinuteVersion: data.twoMinuteVersion ?? null,
      trigger: data.trigger ?? null,
      ifThenPlan: data.ifThenPlan ?? null,
      frequency: data.frequency,
      reminderTime: data.reminderTime ?? null,
      isActive: true,
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(habits).values(newHabit);

    // Create initial streak record
    await db.insert(habitStreaks).values({
      id: nanoid(),
      habitId: habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newHabit,
          category: data.category,
          currentStreak: 0,
          bestStreak: 0,
          completedToday: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/habits error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create habit" },
      { status: 500 }
    );
  }
}
