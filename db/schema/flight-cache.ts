import { pgTable, text, date, jsonb, timestamp, serial } from "drizzle-orm/pg-core";

export const flightSearchCache = pgTable("flight_search_cache", {
  id: serial("id").primaryKey(),
  originCode: text("origin_code").notNull(),
  destCode: text("dest_code").notNull(),
  departureDate: date("departure_date", { mode: "string" }).notNull(),
  resultJson: jsonb("result_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
