import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { trips, tripDays } from "@/db/schema";
import { generateTrip } from "@/lib/ai/generate-trip";
import { TRIP_MODES } from "@/lib/types/trip";
import { nanoid } from "nanoid";

const tripConfigSchema = z.object({
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
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = tripConfigSchema.safeParse(body.config);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid config", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const config = parsed.data;

  let itinerary;
  try {
    itinerary = await generateTrip(config);
  } catch (err) {
    console.error("generateTrip failed:", err);
    return NextResponse.json(
      { error: "AI generation failed, please try again" },
      { status: 500 },
    );
  }

  const tripId = nanoid();
  const title = `${config.destination.name}${config.days}日${(() => {
    const labels: Record<string, string> = {
      commando: "特种兵",
      relaxed: "休闲",
      vacation: "度假",
      foodie: "美食",
      cultural: "文化",
    };
    return labels[config.mode] ?? "";
  })()}游`;

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
    where: (trips, { eq }) => eq(trips.id, tripId),
  });

  return NextResponse.json({ trip, days }, { status: 201 });
}
