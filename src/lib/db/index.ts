import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Create client only when environment variables are available
const client = process.env.TURSO_DATABASE_URL
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : null;

// DB will be null during build time, but available at runtime
export const db = client ? drizzle(client, { schema }) : null;

// Helper to get db with runtime check
export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Check TURSO_DATABASE_URL.");
  }
  return db;
}

export * from "./schema";
