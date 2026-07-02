import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const trips = pgTable("trips", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  config: jsonb("config").notNull(),
  overview: text("overview").notNull().default(""),
  status: text("status").notNull().default("generated"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tripDays = pgTable("trip_days", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  date: text("date").notNull(),
  theme: text("theme").notNull().default(""),
  activities: jsonb("activities").notNull().default("[]"),
});
