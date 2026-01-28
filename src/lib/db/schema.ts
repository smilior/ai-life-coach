import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ========================================
// Better Auth Tables
// ========================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
  createdAt: text("created_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: text("access_token_expires_at"),
  refreshTokenExpiresAt: text("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  createdAt: text("created_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
});

// ========================================
// User Profile
// ========================================

export const userProfiles = sqliteTable(
  "user_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    nickname: text("nickname"),
    purpose: text("purpose"), // 'performance' | 'mental' | 'transformation'
    values: text("values"), // JSON array of values
    motivation: text("motivation"),
    wakeUpTime: text("wake_up_time"),
    sleepTime: text("sleep_time"),
    notificationsEnabled: integer("notifications_enabled", { mode: "boolean" }).default(true),
    onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).default(false),
    createdAt: text("created_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
  },
  (table) => [index("idx_user_profiles_user_id").on(table.userId)]
);

// ========================================
// Coaching Sessions
// ========================================

export const coachingSessions = sqliteTable(
  "coaching_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionType: text("session_type").notNull(), // 'onboarding' | 'free' | 'daily_checkin' | 'weekly_review'
    status: text("status").default("active").notNull(), // 'active' | 'completed' | 'abandoned'
    currentStep: integer("current_step").default(1),
    context: text("context"), // JSON for session context
    summary: text("summary"),
    startedAt: text("started_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
    completedAt: text("completed_at"),
    createdAt: text("created_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
  },
  (table) => [
    index("idx_coaching_sessions_user_id").on(table.userId),
    index("idx_coaching_sessions_status").on(table.status),
  ]
);

export const coachingMessages = sqliteTable(
  "coaching_messages",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => coachingSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'user' | 'assistant'
    content: text("content").notNull(),
    step: integer("step"),
    metadata: text("metadata"), // JSON for additional data
    createdAt: text("created_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
  },
  (table) => [index("idx_coaching_messages_session_id").on(table.sessionId)]
);

// ========================================
// Habits
// ========================================

export const habits = sqliteTable(
  "habits",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    twoMinuteVersion: text("two_minute_version"),
    trigger: text("trigger"), // For habit stacking
    ifThenPlan: text("if_then_plan"),
    frequency: text("frequency").default("daily"), // 'daily' | 'weekly' | 'custom'
    reminderTime: text("reminder_time"),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    order: integer("order").default(0),
    createdAt: text("created_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
  },
  (table) => [
    index("idx_habits_user_id").on(table.userId),
    index("idx_habits_active").on(table.isActive),
  ]
);

export const habitLogs = sqliteTable(
  "habit_logs",
  {
    id: text("id").primaryKey(),
    habitId: text("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    completedAt: text("completed_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
    note: text("note"),
    mood: integer("mood"), // 1-5 scale
  },
  (table) => [
    index("idx_habit_logs_habit_id").on(table.habitId),
    index("idx_habit_logs_completed_at").on(table.completedAt),
  ]
);

export const habitStreaks = sqliteTable(
  "habit_streaks",
  {
    id: text("id").primaryKey(),
    habitId: text("habit_id")
      .notNull()
      .unique()
      .references(() => habits.id, { onDelete: "cascade" }),
    currentStreak: integer("current_streak").default(0),
    longestStreak: integer("longest_streak").default(0),
    lastCompletedDate: text("last_completed_date"),
    updatedAt: text("updated_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
  },
  (table) => [index("idx_habit_streaks_habit_id").on(table.habitId)]
);

// ========================================
// Badges
// ========================================

export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // 'streak' | 'habit' | 'coaching' | 'special'
  condition: text("condition").notNull(), // JSON condition for unlocking
  createdAt: text("created_at")
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
    .notNull(),
});

export const userBadges = sqliteTable(
  "user_badges",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: text("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: text("earned_at")
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
      .notNull(),
  },
  (table) => [
    index("idx_user_badges_user_id").on(table.userId),
    index("idx_user_badges_badge_id").on(table.badgeId),
  ]
);

// ========================================
// Type Exports
// ========================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type CoachingSession = typeof coachingSessions.$inferSelect;
export type NewCoachingSession = typeof coachingSessions.$inferInsert;

export type CoachingMessage = typeof coachingMessages.$inferSelect;
export type NewCoachingMessage = typeof coachingMessages.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type HabitLog = typeof habitLogs.$inferSelect;
export type NewHabitLog = typeof habitLogs.$inferInsert;

export type HabitStreak = typeof habitStreaks.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
