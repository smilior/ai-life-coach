"use server";

import { getAuth } from "@/lib/auth";
import {
  getDb,
  habits,
  habitLogs,
  habitStreaks,
} from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

// ========================================
// Validation Schemas
// ========================================

const categoryEnum = z.enum(["health", "learning", "work", "life", "other"]);
const frequencyEnum = z.enum(["daily", "weekdays", "weekends", "custom"]);

const createHabitSchema = z.object({
  name: z.string().min(1, "習慣名は必須です").max(100),
  description: z.string().max(500).optional(),
  category: categoryEnum,
  twoMinuteVersion: z.string().max(200).optional(),
  trigger: z.string().max(200).optional(),
  ifThenPlan: z.string().max(500).optional(),
  frequency: frequencyEnum,
  customDays: z.array(z.number().min(0).max(6)).optional(),
  reminderTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:MM形式で入力してください")
    .optional(),
  targetDays: z.number().min(1).max(365).optional(),
});

const updateHabitSchema = z.object({
  name: z.string().min(1, "習慣名は必須です").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  category: categoryEnum.optional(),
  twoMinuteVersion: z.string().max(200).optional().nullable(),
  trigger: z.string().max(200).optional().nullable(),
  ifThenPlan: z.string().max(500).optional().nullable(),
  frequency: frequencyEnum.optional(),
  customDays: z.array(z.number().min(0).max(6)).optional().nullable(),
  reminderTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:MM形式で入力してください")
    .optional()
    .nullable(),
  targetDays: z.number().min(1).max(365).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ========================================
// Types
// ========================================

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

export type HabitData = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string;
  twoMinuteVersion: string | null;
  trigger: string | null;
  ifThenPlan: string | null;
  frequency: string;
  customDays: number[] | null;
  reminderTime: string | null;
  targetDays: number | null;
  currentStreak: number;
  bestStreak: number;
  isActive: boolean;
  completedToday: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitLogData = {
  id: string;
  habitId: string;
  completedAt: string;
  note: string | null;
  mood: number | null;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> };

// ========================================
// Helper Functions
// ========================================

async function getSession() {
  const auth = getAuth();
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isToday(dateStr: string): boolean {
  const today = getTodayDateString();
  return dateStr.startsWith(today);
}

// ========================================
// Server Actions
// ========================================

/**
 * Get all habits for the current user
 */
export async function getHabits(): Promise<ActionResult<HabitData[]>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    const userHabits = await db.query.habits.findMany({
      where: eq(habits.userId, session.user.id),
      orderBy: [habits.order],
    });

    // Get streaks and today's logs for each habit
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
          category: habit.frequency === "daily" ? "health" : "other",
          twoMinuteVersion: habit.twoMinuteVersion,
          trigger: habit.trigger,
          ifThenPlan: habit.ifThenPlan,
          frequency: habit.frequency ?? "daily",
          customDays: null,
          reminderTime: habit.reminderTime,
          targetDays: null,
          currentStreak: streak?.currentStreak ?? 0,
          bestStreak: streak?.longestStreak ?? 0,
          isActive: habit.isActive ?? true,
          completedToday,
          createdAt: habit.createdAt,
          updatedAt: habit.updatedAt,
        } satisfies HabitData;
      })
    );

    return { success: true, data: habitsWithDetails };
  } catch (error) {
    console.error("getHabits error:", error);
    return { success: false, error: "Failed to fetch habits" };
  }
}

/**
 * Get a single habit by ID
 */
export async function getHabit(
  habitId: string
): Promise<ActionResult<HabitData>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, habitId), eq(habits.userId, session.user.id)),
    });

    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    const streak = await db.query.habitStreaks.findFirst({
      where: eq(habitStreaks.habitId, habit.id),
    });

    const logs = await db.query.habitLogs.findMany({
      where: eq(habitLogs.habitId, habit.id),
      orderBy: [desc(habitLogs.completedAt)],
    });

    const completedToday = logs.some((log) => isToday(log.completedAt));

    return {
      success: true,
      data: {
        id: habit.id,
        userId: habit.userId,
        name: habit.name,
        description: habit.description,
        category: habit.frequency === "daily" ? "health" : "other",
        twoMinuteVersion: habit.twoMinuteVersion,
        trigger: habit.trigger,
        ifThenPlan: habit.ifThenPlan,
        frequency: habit.frequency ?? "daily",
        customDays: null,
        reminderTime: habit.reminderTime,
        targetDays: null,
        currentStreak: streak?.currentStreak ?? 0,
        bestStreak: streak?.longestStreak ?? 0,
        isActive: habit.isActive ?? true,
        completedToday,
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
      },
    };
  } catch (error) {
    console.error("getHabit error:", error);
    return { success: false, error: "Failed to fetch habit" };
  }
}

/**
 * Create a new habit
 */
export async function createHabit(
  input: CreateHabitInput
): Promise<ActionResult<HabitData>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const validationResult = createHabitSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input",
        details: validationResult.error.flatten()
          .fieldErrors as Record<string, string[]>,
      };
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

    revalidatePath("/habits");

    return {
      success: true,
      data: {
        id: newHabit.id,
        userId: newHabit.userId,
        name: newHabit.name,
        description: newHabit.description,
        category: data.category,
        twoMinuteVersion: newHabit.twoMinuteVersion,
        trigger: newHabit.trigger,
        ifThenPlan: newHabit.ifThenPlan,
        frequency: newHabit.frequency,
        customDays: data.customDays ?? null,
        reminderTime: newHabit.reminderTime,
        targetDays: data.targetDays ?? null,
        currentStreak: 0,
        bestStreak: 0,
        isActive: true,
        completedToday: false,
        createdAt: now,
        updatedAt: now,
      },
    };
  } catch (error) {
    console.error("createHabit error:", error);
    return { success: false, error: "Failed to create habit" };
  }
}

/**
 * Update an existing habit
 */
export async function updateHabit(
  habitId: string,
  input: UpdateHabitInput
): Promise<ActionResult<HabitData>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const validationResult = updateHabitSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input",
        details: validationResult.error.flatten()
          .fieldErrors as Record<string, string[]>,
      };
    }

    const data = validationResult.data;
    const db = getDb();

    // Verify ownership
    const existingHabit = await db.query.habits.findFirst({
      where: and(eq(habits.id, habitId), eq(habits.userId, session.user.id)),
    });

    if (!existingHabit) {
      return { success: false, error: "Habit not found" };
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

    await db.update(habits).set(updateData).where(eq(habits.id, habitId));

    // Fetch updated habit
    const result = await getHabit(habitId);
    revalidatePath("/habits");
    revalidatePath(`/habits/${habitId}`);

    return result;
  } catch (error) {
    console.error("updateHabit error:", error);
    return { success: false, error: "Failed to update habit" };
  }
}

/**
 * Delete a habit
 */
export async function deleteHabit(
  habitId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    // Verify ownership
    const existingHabit = await db.query.habits.findFirst({
      where: and(eq(habits.id, habitId), eq(habits.userId, session.user.id)),
    });

    if (!existingHabit) {
      return { success: false, error: "Habit not found" };
    }

    await db.delete(habits).where(eq(habits.id, habitId));

    revalidatePath("/habits");

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("deleteHabit error:", error);
    return { success: false, error: "Failed to delete habit" };
  }
}

/**
 * Check/uncheck a habit for today
 */
export async function checkHabit(
  habitId: string
): Promise<ActionResult<{ checked: boolean; streak: number }>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    // Verify ownership
    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, habitId), eq(habits.userId, session.user.id)),
    });

    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    // Check if already completed today
    const todayStr = getTodayDateString();
    const todayLogs = await db.query.habitLogs.findMany({
      where: eq(habitLogs.habitId, habitId),
    });

    const todayLog = todayLogs.find((log) => isToday(log.completedAt));

    if (todayLog) {
      // Uncheck: remove today's log
      await db.delete(habitLogs).where(eq(habitLogs.id, todayLog.id));

      // Update streak
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

        revalidatePath("/habits");
        revalidatePath(`/habits/${habitId}`);
        return { success: true, data: { checked: false, streak: newStreak } };
      }

      revalidatePath("/habits");
      return { success: true, data: { checked: false, streak: 0 } };
    } else {
      // Check: add log
      await db.insert(habitLogs).values({
        id: nanoid(),
        habitId: habitId,
        completedAt: new Date().toISOString(),
        note: null,
        mood: null,
      });

      // Update streak
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

        revalidatePath("/habits");
        revalidatePath(`/habits/${habitId}`);
        return { success: true, data: { checked: true, streak: newStreak } };
      } else {
        // Create streak if not exists
        await db.insert(habitStreaks).values({
          id: nanoid(),
          habitId: habitId,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: todayStr,
          updatedAt: new Date().toISOString(),
        });

        revalidatePath("/habits");
        revalidatePath(`/habits/${habitId}`);
        return { success: true, data: { checked: true, streak: 1 } };
      }
    }
  } catch (error) {
    console.error("checkHabit error:", error);
    return { success: false, error: "Failed to check habit" };
  }
}

/**
 * Get habit logs for a specific habit
 */
export async function getHabitLogs(
  habitId: string
): Promise<ActionResult<HabitLogData[]>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    // Verify ownership
    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, habitId), eq(habits.userId, session.user.id)),
    });

    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    const logs = await db.query.habitLogs.findMany({
      where: eq(habitLogs.habitId, habitId),
      orderBy: [desc(habitLogs.completedAt)],
    });

    return {
      success: true,
      data: logs.map((log) => ({
        id: log.id,
        habitId: log.habitId,
        completedAt: log.completedAt,
        note: log.note,
        mood: log.mood,
      })),
    };
  } catch (error) {
    console.error("getHabitLogs error:", error);
    return { success: false, error: "Failed to fetch habit logs" };
  }
}

/**
 * Get streak info for a habit
 */
export async function getStreak(
  habitId: string
): Promise<
  ActionResult<{
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
  }>
> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    // Verify ownership
    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, habitId), eq(habits.userId, session.user.id)),
    });

    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    const streak = await db.query.habitStreaks.findFirst({
      where: eq(habitStreaks.habitId, habitId),
    });

    return {
      success: true,
      data: {
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
        lastCompletedDate: streak?.lastCompletedDate ?? null,
      },
    };
  } catch (error) {
    console.error("getStreak error:", error);
    return { success: false, error: "Failed to fetch streak" };
  }
}
