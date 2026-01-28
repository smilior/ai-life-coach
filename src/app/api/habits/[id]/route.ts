import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, habits, habitStreaks, habitLogs } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ========================================
// Validation
// ========================================

const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(["health", "learning", "work", "life", "other"]).optional(),
  twoMinuteVersion: z.string().max(200).optional().nullable(),
  trigger: z.string().max(200).optional().nullable(),
  ifThenPlan: z.string().max(500).optional().nullable(),
  frequency: z.enum(["daily", "weekdays", "weekends", "custom"]).optional(),
  customDays: z.array(z.number().min(0).max(6)).optional().nullable(),
  reminderTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .nullable(),
  targetDays: z.number().min(1).max(365).optional().nullable(),
  isActive: z.boolean().optional(),
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
// GET: Get single habit
// ========================================

export async function GET(
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

    const { id } = await params;
    const db = getDb();

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, session.user.id)),
    });

    if (!habit) {
      return NextResponse.json(
        { error: "Not Found", message: "Habit not found" },
        { status: 404 }
      );
    }

    const streak = await db.query.habitStreaks.findFirst({
      where: eq(habitStreaks.habitId, habit.id),
    });

    const logs = await db.query.habitLogs.findMany({
      where: eq(habitLogs.habitId, habit.id),
      orderBy: [desc(habitLogs.completedAt)],
    });

    const completedToday = logs.some((log) => isToday(log.completedAt));

    return NextResponse.json({
      success: true,
      data: {
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
        logs: logs.map((l) => ({
          id: l.id,
          completedAt: l.completedAt,
          note: l.note,
          mood: l.mood,
        })),
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/habits/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch habit" },
      { status: 500 }
    );
  }
}

// ========================================
// PATCH: Update habit
// ========================================

export async function PATCH(
  request: NextRequest,
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

    const { id } = await params;
    const body = await request.json();
    const validationResult = updateHabitSchema.safeParse(body);

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

    const existingHabit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, session.user.id)),
    });

    if (!existingHabit) {
      return NextResponse.json(
        { error: "Not Found", message: "Habit not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.twoMinuteVersion !== undefined)
      updateData.twoMinuteVersion = data.twoMinuteVersion;
    if (data.trigger !== undefined) updateData.trigger = data.trigger;
    if (data.ifThenPlan !== undefined) updateData.ifThenPlan = data.ifThenPlan;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.reminderTime !== undefined)
      updateData.reminderTime = data.reminderTime;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await db.update(habits).set(updateData).where(eq(habits.id, id));

    const updatedHabit = await db.query.habits.findFirst({
      where: eq(habits.id, id),
    });

    if (!updatedHabit) {
      return NextResponse.json(
        {
          error: "Internal Server Error",
          message: "Failed to fetch updated habit",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedHabit.id,
        name: updatedHabit.name,
        description: updatedHabit.description,
        twoMinuteVersion: updatedHabit.twoMinuteVersion,
        trigger: updatedHabit.trigger,
        ifThenPlan: updatedHabit.ifThenPlan,
        frequency: updatedHabit.frequency,
        reminderTime: updatedHabit.reminderTime,
        isActive: updatedHabit.isActive,
        updatedAt: updatedHabit.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/habits/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update habit" },
      { status: 500 }
    );
  }
}

// ========================================
// DELETE: Delete habit
// ========================================

export async function DELETE(
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

    const { id } = await params;
    const db = getDb();

    const existingHabit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, session.user.id)),
    });

    if (!existingHabit) {
      return NextResponse.json(
        { error: "Not Found", message: "Habit not found" },
        { status: 404 }
      );
    }

    await db.delete(habits).where(eq(habits.id, id));

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("DELETE /api/habits/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete habit" },
      { status: 500 }
    );
  }
}
