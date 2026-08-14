import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  googleId: text("google_id").unique(),
  email: text("email"),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Anonymous unique-visitor tracking: one row per browser (cookie-identified),
// counting every visitor whether or not they ever log in.
export const uniqueVisitorsTable = pgTable("unique_visitors", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull().unique(),
  visitCount: integer("visit_count").notNull().default(1),
  aiTokensUsed: integer("ai_tokens_used").notNull().default(0),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userVisitsTable = pgTable("user_visits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  email: text("email"),
  visitedAt: timestamp("visited_at", { withTimezone: true }).notNull().defaultNow(),
});
