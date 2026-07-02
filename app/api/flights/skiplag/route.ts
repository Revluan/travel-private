import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getAirportByCode, getCityForCode } from "@/lib/flights/data";
import { getCtripCode } from "@/lib/flights/data/ctrip";

const skiplagSchema = z.object({
  originCode: z.string().length(3).toUpperCase(),
  destCode: z.string().length(3).toUpperCase(),
  directLowestPrice: z.number().positive(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

interface SkiplagDeal {
  beyondCity: string;
  beyondCode: string;
  flight: {
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    origin: string;
    destination: string;
    price: number;
    currency: string;
    stops: number;
  };
  savedAmount: number;
  savedPercent: number;
}

const AIRLINES = [
  { code: "9C", name: "春秋航空" },
  { code: "HO", name: "吉祥航空" },
  { code: "CZ", name: "南方航空" },
  { code: "MU", name: "东方航空" },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

interface CtripPriceResponse {
  data?: { oneWayPrice?: Array<Record<string, number>> };
}

async function fetchCtripPrice(
  originCtrip: string,
  destCtrip: string,
  direct: boolean
): Promise<Record<string, number>> {
  const url = `https://flights.ctrip.com/itinerary/api/12808/lowestPrice?flightWay=Oneway&dcity=${originCtrip}&acity=${destCtrip}&direct=${direct}&army=false`;
  try {
    const res = await fetch(url);
    const json: CtripPriceResponse = await res.json();
    return Object.assign({}, ...(json.data?.oneWayPrice ?? []));
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = skiplagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid params", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { originCode, destCode, directLowestPrice, departureDate } = parsed.data;

  const targetAirport = getAirportByCode(destCode);
  if (!targetAirport) {
    return NextResponse.json({ error: "Unknown destination airport" }, { status: 400 });
  }

  const originCity = getCityForCode(originCode) ?? "";
  const originCtrip = getCtripCode(originCity) ?? originCode;

  const dateKey = departureDate.replace(/-/g, "");
  const deals: SkiplagDeal[] = [];
  const seed = hashStr(`${originCode}-${destCode}-${departureDate}`);
  const rand = seededRandom(seed);

  for (const beyondCode of targetAirport.commonConnections) {
    if (beyondCode === originCode) continue;
    const beyondCity = getCityForCode(beyondCode) ?? beyondCode;
    const beyondCtrip = getCtripCode(beyondCity) ?? beyondCode;
    if (!beyondCtrip) continue;

    const priceMap = await fetchCtripPrice(originCtrip, beyondCtrip, false);
    const connectingPrice = priceMap[dateKey];

    if (connectingPrice !== undefined && connectingPrice < directLowestPrice) {
      const savedAmount = directLowestPrice - connectingPrice;
      const airline = AIRLINES[Math.floor(rand() * AIRLINES.length)];
      const flightNum = 2000 + Math.floor(rand() * 9000);
      const depHour = 6 + Math.floor(rand() * 16);
      const depMin = [0, 30][Math.floor(rand() * 2)];

      deals.push({
        beyondCity,
        beyondCode,
        flight: {
          airline: airline.name,
          flightNumber: `${airline.code}${flightNum}`,
          departureTime: `${departureDate}T${String(depHour).padStart(2, "0")}:${String(depMin).padStart(2, "0")}:00`,
          arrivalTime: `${departureDate}T${String(depHour + 5).padStart(2, "0")}:${String(depMin).padStart(2, "0")}:00`,
          origin: originCode,
          destination: beyondCode,
          price: connectingPrice,
          currency: "CNY",
          stops: 1,
        },
        savedAmount,
        savedPercent: Math.round((savedAmount / directLowestPrice) * 100),
      });
    }
  }

  deals.sort((a, b) => b.savedAmount - a.savedAmount);
  return NextResponse.json({ deals });
}
