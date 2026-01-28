"use server";

import { getAuth } from "@/lib/auth";
import { getDb, userProfiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

// ========================================
// Validation Schemas
// ========================================

const purposeEnum = z.enum(["performance", "mental", "transformation"]);

const createProfileSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  purpose: purposeEnum,
  values: z.array(z.string().max(200)).min(1).max(10),
  motivation: z.string().min(1).max(1000),
  wakeUpTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),
  sleepTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),
});

const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  purpose: purposeEnum.optional(),
  values: z.array(z.string().max(200)).min(1).max(10).optional(),
  motivation: z.string().min(1).max(1000).optional(),
  wakeUpTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional()
    .nullable(),
  sleepTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional()
    .nullable(),
  notificationsEnabled: z.boolean().optional(),
});

// ========================================
// Types
// ========================================

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type ProfileData = {
  id: string;
  userId: string;
  nickname: string | null;
  purpose: string | null;
  values: string[];
  motivation: string | null;
  wakeUpTime: string | null;
  sleepTime: string | null;
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
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

function parseValues(values: string | null): string[] {
  if (!values) return [];
  try {
    return JSON.parse(values);
  } catch {
    return [];
  }
}

function formatProfile(profile: typeof userProfiles.$inferSelect): ProfileData {
  return {
    id: profile.id,
    userId: profile.userId,
    nickname: profile.nickname,
    purpose: profile.purpose,
    values: parseValues(profile.values),
    motivation: profile.motivation,
    wakeUpTime: profile.wakeUpTime,
    sleepTime: profile.sleepTime,
    notificationsEnabled: profile.notificationsEnabled ?? true,
    onboardingCompleted: profile.onboardingCompleted ?? false,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

// ========================================
// Server Actions
// ========================================

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<ActionResult<ProfileData | null>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!profile) {
      return { success: true, data: null };
    }

    return { success: true, data: formatProfile(profile) };
  } catch (error) {
    console.error("getProfile error:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}

/**
 * Create a new profile (during onboarding)
 */
export async function createProfile(
  input: CreateProfileInput
): Promise<ActionResult<ProfileData>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const validationResult = createProfileSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input",
        details: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const data = validationResult.data;
    const db = getDb();

    // Check if profile already exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (existingProfile) {
      return { success: false, error: "Profile already exists. Use updateProfile instead." };
    }

    const now = new Date().toISOString();
    const newProfile = {
      id: nanoid(),
      userId: session.user.id,
      nickname: data.nickname ?? null,
      purpose: data.purpose,
      values: JSON.stringify(data.values),
      motivation: data.motivation,
      wakeUpTime: data.wakeUpTime ?? null,
      sleepTime: data.sleepTime ?? null,
      notificationsEnabled: true,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(userProfiles).values(newProfile);

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/onboarding");

    return {
      success: true,
      data: formatProfile({
        ...newProfile,
        notificationsEnabled: true,
        onboardingCompleted: false,
      }),
    };
  } catch (error) {
    console.error("createProfile error:", error);
    return { success: false, error: "Failed to create profile" };
  }
}

/**
 * Update the current user's profile
 */
export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult<ProfileData>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const validationResult = updateProfileSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input",
        details: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const data = validationResult.data;
    const db = getDb();

    // Check if profile exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!existingProfile) {
      return { success: false, error: "Profile not found. Create one first." };
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.nickname !== undefined) {
      updateData.nickname = data.nickname;
    }
    if (data.purpose !== undefined) {
      updateData.purpose = data.purpose;
    }
    if (data.values !== undefined) {
      updateData.values = JSON.stringify(data.values);
    }
    if (data.motivation !== undefined) {
      updateData.motivation = data.motivation;
    }
    if (data.wakeUpTime !== undefined) {
      updateData.wakeUpTime = data.wakeUpTime;
    }
    if (data.sleepTime !== undefined) {
      updateData.sleepTime = data.sleepTime;
    }
    if (data.notificationsEnabled !== undefined) {
      updateData.notificationsEnabled = data.notificationsEnabled;
    }

    await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.userId, session.user.id));

    // Fetch updated profile
    const updatedProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!updatedProfile) {
      return { success: false, error: "Failed to fetch updated profile" };
    }

    revalidatePath("/");
    revalidatePath("/profile");

    return { success: true, data: formatProfile(updatedProfile) };
  } catch (error) {
    console.error("updateProfile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Complete onboarding process
 */
export async function completeOnboarding(): Promise<
  ActionResult<{ completedAt: string }>
> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    // Check if profile exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!existingProfile) {
      return { success: false, error: "Profile not found. Complete profile setup first." };
    }

    // Validate required fields
    if (!existingProfile.purpose || !existingProfile.values || !existingProfile.motivation) {
      return {
        success: false,
        error: "Please complete all required onboarding steps before marking as complete.",
      };
    }

    // Already completed
    if (existingProfile.onboardingCompleted) {
      return {
        success: true,
        data: { completedAt: existingProfile.updatedAt },
      };
    }

    // Mark as complete
    const now = new Date().toISOString();
    await db
      .update(userProfiles)
      .set({
        onboardingCompleted: true,
        updatedAt: now,
      })
      .where(eq(userProfiles.userId, session.user.id));

    revalidatePath("/");
    revalidatePath("/onboarding");

    return { success: true, data: { completedAt: now } };
  } catch (error) {
    console.error("completeOnboarding error:", error);
    return { success: false, error: "Failed to complete onboarding" };
  }
}

/**
 * Check onboarding status
 */
export async function getOnboardingStatus(): Promise<
  ActionResult<{
    hasProfile: boolean;
    onboardingCompleted: boolean;
    missingSteps: string[];
  }>
> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!profile) {
      return {
        success: true,
        data: {
          hasProfile: false,
          onboardingCompleted: false,
          missingSteps: ["profile_creation", "purpose", "values", "motivation"],
        },
      };
    }

    const missingSteps: string[] = [];
    if (!profile.purpose) missingSteps.push("purpose");
    if (!profile.values) missingSteps.push("values");
    if (!profile.motivation) missingSteps.push("motivation");

    return {
      success: true,
      data: {
        hasProfile: true,
        onboardingCompleted: profile.onboardingCompleted ?? false,
        missingSteps,
      },
    };
  } catch (error) {
    console.error("getOnboardingStatus error:", error);
    return { success: false, error: "Failed to check onboarding status" };
  }
}
