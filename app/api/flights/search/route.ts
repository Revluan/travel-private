import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { flightProvider } from "@/lib/flights";
import { getAirportsByProvince } from "@/lib/flights/data";
import { getCache, setCache } from "@/lib/flights/cache";
import type { FlightOffer } from "@/lib/flights";

const searchSchema = z.object({
  originCode: z.string().length(3).toUpperCase(),
  province: z.string().min(1),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid params", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { originCode, province, departureDate } = parsed.data;

  if (departureDate < new Date().toISOString().slice(0, 10)) {
    return NextResponse.json(
      { error: "Departure date must be today or later" },
      { status: 400 }
    );
  }

  const airports = getAirportsByProvince(province);

  if (airports.length === 0) {
    return NextResponse.json({ results: [], message: "该省份暂无可用机场" });
  }

  const results: Array<{
    city: string;
    airportCode: string;
    airportName: string;
    flights: FlightOffer[];
    lowestPrice: number | null;
    error?: string;
  }> = [];

  for (const airport of airports) {
    try {
      const cached = await getCache(originCode, airport.code, departureDate);
      if (cached) {
        results.push(cached as typeof results[number]);
        continue;
      }
    } catch {
      // cache miss, proceed to API call
    }

    try {
      const flights = await flightProvider.searchOffers({
        originCode,
        destCode: airport.code,
        departureDate,
      });

      const lowestPrice =
        flights.length > 0
          ? Math.min(...flights.map((f) => f.price))
          : null;

      const result = {
        city: airport.city,
        airportCode: airport.code,
        airportName: airport.name,
        flights,
        lowestPrice,
      };

      results.push(result);

      try {
        await setCache(originCode, airport.code, departureDate, result);
      } catch {
        // cache write failure is non-fatal
      }
    } catch (err) {
      const result = {
        city: airport.city,
        airportCode: airport.code,
        airportName: airport.name,
        flights: [],
        lowestPrice: null,
        error: "查询失败",
      };
      results.push(result);
      console.error(`flight search failed for ${originCode}→${airport.code}:`, err);
    }
  }

  results.sort((a, b) => {
    if (a.lowestPrice === null && b.lowestPrice === null) return 0;
    if (a.lowestPrice === null) return 1;
    if (b.lowestPrice === null) return -1;
    return a.lowestPrice - b.lowestPrice;
  });

  return NextResponse.json({ results });
}
