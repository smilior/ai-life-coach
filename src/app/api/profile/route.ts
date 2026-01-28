import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, userProfiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

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

export type CreateProfileRequest = z.infer<typeof createProfileSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

export type ProfileResponse = {
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

function formatProfileResponse(profile: typeof userProfiles.$inferSelect): ProfileResponse {
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
// GET: Get current user's profile
// ========================================

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Not Found", message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatProfileResponse(profile),
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// ========================================
// POST: Create new profile (onboarding)
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
    const validationResult = createProfileSchema.safeParse(body);

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

    // Check if profile already exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Conflict", message: "Profile already exists. Use PATCH to update." },
        { status: 409 }
      );
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

    return NextResponse.json(
      {
        success: true,
        data: formatProfileResponse({
          ...newProfile,
          notificationsEnabled: true,
          onboardingCompleted: false,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create profile" },
      { status: 500 }
    );
  }
}

// ========================================
// PATCH: Update existing profile
// ========================================

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

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

    // Check if profile exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Not Found", message: "Profile not found. Create one first." },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Internal Server Error", message: "Failed to fetch updated profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatProfileResponse(updatedProfile),
    });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
