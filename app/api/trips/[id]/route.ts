import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { trips, tripDays } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ACTIVITY_TYPES } from "@/lib/types/trip";

const saveSchema = z.object({
  overview: z.string(),
  days: z.array(
    z.object({
      id: z.string().optional(),
      dayNumber: z.number().int().positive(),
      date: z.string(),
      theme: z.string(),
      activities: z.array(
        z.object({
          time: z.string(),
          title: z.string(),
          description: z.string(),
          location: z.string(),
          type: z.enum(ACTIVITY_TYPES),
        }),
      ),
    }),
  ),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const trip = await db.query.trips.findFirst({
    where: and(eq(trips.id, id), eq(trips.userId, userId)),
  });

  if (!trip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const days = await db.query.tripDays.findMany({
    where: eq(tripDays.tripId, id),
    orderBy: (tripDays, { asc }) => [asc(tripDays.dayNumber)],
  });

  return NextResponse.json({ ...trip, days });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const trip = await db.query.trips.findFirst({
    where: and(eq(trips.id, id), eq(trips.userId, userId)),
  });

  if (!trip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { overview, days } = parsed.data;

  await db.update(trips).set({ overview, status: "saved" }).where(eq(trips.id, id));

  await db.delete(tripDays).where(eq(tripDays.tripId, id));

  if (days.length > 0) {
    await db.insert(tripDays).values(
      days.map((day) => ({
        id: day.id ?? nanoid(),
        tripId: id,
        dayNumber: day.dayNumber,
        date: day.date,
        theme: day.theme,
        activities: day.activities,
      })),
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const trip = await db.query.trips.findFirst({
    where: and(eq(trips.id, id), eq(trips.userId, userId)),
  });

  if (!trip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(trips).where(eq(trips.id, id));

  return NextResponse.json({ success: true });
}
