import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb, userProfiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

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

// ========================================
// POST: Complete onboarding
// ========================================

export async function POST(_request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getDb();

    // Check if profile exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
    });

    if (!existingProfile) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Profile not found. Complete profile setup first.",
        },
        { status: 404 }
      );
    }

    // Validate that required onboarding fields are filled
    if (!existingProfile.purpose || !existingProfile.values || !existingProfile.motivation) {
      return NextResponse.json(
        {
          error: "Precondition Failed",
          message: "Please complete all required onboarding steps before marking as complete.",
          missingFields: {
            purpose: !existingProfile.purpose,
            values: !existingProfile.values,
            motivation: !existingProfile.motivation,
          },
        },
        { status: 412 }
      );
    }

    // Check if already completed
    if (existingProfile.onboardingCompleted) {
      return NextResponse.json({
        success: true,
        message: "Onboarding already completed",
        data: {
          onboardingCompleted: true,
          completedAt: existingProfile.updatedAt,
        },
      });
    }

    // Mark onboarding as complete
    const now = new Date().toISOString();
    await db
      .update(userProfiles)
      .set({
        onboardingCompleted: true,
        updatedAt: now,
      })
      .where(eq(userProfiles.userId, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        onboardingCompleted: true,
        completedAt: now,
      },
    });
  } catch (error) {
    console.error("POST /api/onboarding/complete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

// ========================================
// GET: Check onboarding status
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
      return NextResponse.json({
        success: true,
        data: {
          hasProfile: false,
          onboardingCompleted: false,
          missingSteps: ["profile_creation", "purpose", "values", "motivation"],
        },
      });
    }

    const missingSteps: string[] = [];
    if (!profile.purpose) missingSteps.push("purpose");
    if (!profile.values) missingSteps.push("values");
    if (!profile.motivation) missingSteps.push("motivation");

    return NextResponse.json({
      success: true,
      data: {
        hasProfile: true,
        onboardingCompleted: profile.onboardingCompleted ?? false,
        missingSteps,
        completedAt: profile.onboardingCompleted ? profile.updatedAt : null,
      },
    });
  } catch (error) {
    console.error("GET /api/onboarding/complete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}
