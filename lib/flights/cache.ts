import { db } from "@/lib/db/client";
import { flightSearchCache } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const CACHE_TTL_HOURS = 4;

export async function getCache(
  originCode: string,
  destCode: string,
  departureDate: string
): Promise<unknown | null> {
  const rows = await db
    .select()
    .from(flightSearchCache)
    .where(
      and(
        eq(flightSearchCache.originCode, originCode),
        eq(flightSearchCache.destCode, destCode),
        eq(flightSearchCache.departureDate, departureDate)
      )
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expiresAt) < new Date()) return null;
  return row.resultJson;
}

export async function setCache(
  originCode: string,
  destCode: string,
  departureDate: string,
  result: unknown
): Promise<void> {
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);

  // delete existing cache for same key, then insert fresh
  await db
    .delete(flightSearchCache)
    .where(
      and(
        eq(flightSearchCache.originCode, originCode),
        eq(flightSearchCache.destCode, destCode),
        eq(flightSearchCache.departureDate, departureDate)
      )
    );

  await db.insert(flightSearchCache).values({
    originCode,
    destCode,
    departureDate,
    resultJson: result as Record<string, unknown>,
    expiresAt,
  });
}
