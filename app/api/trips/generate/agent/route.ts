import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { TRIP_MODES } from "@/lib/types/trip";
import { createAgentSSE } from "@/lib/agent";

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

  return createAgentSSE(parsed.data, request.signal);
}
