import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { trips, tripDays } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRIP_MODES, ACTIVITY_TYPES } from "@/lib/types/trip";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await db.query.trips.findMany({
    where: eq(trips.userId, userId),
    orderBy: desc(trips.updatedAt),
  });

  return NextResponse.json(list);
}

const saveTripSchema = z.object({
  config: z.object({
    startDate: z.string(),
    endDate: z.string(),
    destination: z.object({
      placeId: z.string(),
      name: z.string(),
      formattedAddress: z.string(),
      lat: z.number(),
      lng: z.number(),
    }),
    budget: z.number().optional(),
    days: z.number().int().positive(),
    peopleCount: z.number().int().positive(),
    mode: z.enum(TRIP_MODES),
  }),
  itinerary: z.object({
    overview: z.string(),
    days: z.array(
      z.object({
        dayNumber: z.number(),
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
  }),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = saveTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { config, itinerary } = parsed.data;

  const modeLabels: Record<string, string> = {
    commando: "特种兵",
    relaxed: "休闲",
    vacation: "度假",
    foodie: "美食",
    cultural: "文化",
  };

  const tripId = nanoid();
  const title = `${config.destination.name}${config.days}日${modeLabels[config.mode] ?? ""}游`;

  await db.insert(trips).values({
    id: tripId,
    userId,
    title,
    config,
    overview: itinerary.overview,
    status: "generated",
  });

  const days = itinerary.days.map((day) => ({
    id: nanoid(),
    tripId,
    dayNumber: day.dayNumber,
    date: day.date,
    theme: day.theme,
    activities: day.activities,
  }));

  if (days.length > 0) {
    await db.insert(tripDays).values(days);
  }

  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  });

  return NextResponse.json({ trip, days }, { status: 201 });
}
