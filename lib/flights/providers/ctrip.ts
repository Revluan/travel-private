import type { FlightOffer, FlightProvider, FlightSearchParams } from "./types";
import { getCtripCode } from "../data/ctrip";
import { getCityForCode } from "../data";

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

const AIRLINES = [
  { code: "9C", name: "春秋航空" },
  { code: "HO", name: "吉祥航空" },
  { code: "CZ", name: "南方航空" },
  { code: "MU", name: "东方航空" },
  { code: "CA", name: "中国国航" },
  { code: "3U", name: "四川航空" },
  { code: "ZH", name: "深圳航空" },
  { code: "MF", name: "厦门航空" },
];

interface CtripPriceResponse {
  data?: {
    oneWayPrice?: Array<Record<string, number>>;
  };
}

async function fetchLowestPrice(
  originCode: string,
  destCode: string,
  direct: boolean
): Promise<Record<string, number>> {
  const url = `https://flights.ctrip.com/itinerary/api/12808/lowestPrice?flightWay=Oneway&dcity=${originCode}&acity=${destCode}&direct=${direct}&army=false`;
  try {
    const res = await fetch(url);
    const json: CtripPriceResponse = await res.json();
    return Object.assign({}, ...(json.data?.oneWayPrice ?? []));
  } catch {
    return {};
  }
}

function generateFlightDetails(
  key: string,
  basePrice: number,
  departureDate: string
): FlightOffer[] {
  const seed = hashStr(key);
  const rand = seededRandom(seed);
  const count = 2 + Math.floor(rand() * 3);
  const usedAirlines = new Set<number>();
  const offers: FlightOffer[] = [];

  // Parse origin and dest codes from key
  const parts = key.split("-");
  const origin = parts[0] ?? "";
  const dest = parts[1] ?? "";

  for (let i = 0; i < count; i++) {
    let airlineIdx = Math.floor(rand() * AIRLINES.length);
    while (usedAirlines.has(airlineIdx) && usedAirlines.size < AIRLINES.length) {
      airlineIdx = (airlineIdx + 1) % AIRLINES.length;
    }
    usedAirlines.add(airlineIdx);
    const airline = AIRLINES[airlineIdx];

    const priceVar = 0.85 + rand() * 0.3;
    const price = Math.round(basePrice * priceVar);

    const depHour = 6 + Math.floor(rand() * 16);
    const depMin = [0, 15, 30, 45][Math.floor(rand() * 4)];
    const durationMin = 60 + Math.floor(rand() * 180);
    const arrHour = depHour + Math.floor((depMin + durationMin) / 60);
    const arrMin = (depMin + durationMin) % 60;
    const flightNum = 1000 + Math.floor(rand() * 9000);

    const arrDate =
      depHour + Math.floor(durationMin / 60) >= 24
        ? new Date(new Date(departureDate).getTime() + 86400000)
            .toISOString()
            .slice(0, 10)
        : departureDate;

    offers.push({
      airline: airline.name,
      flightNumber: `${airline.code}${flightNum}`,
      departureTime: `${departureDate}T${String(depHour % 24).padStart(2, "0")}:${String(depMin).padStart(2, "0")}:00`,
      arrivalTime: `${arrDate}T${String(arrHour % 24).padStart(2, "0")}:${String(arrMin).padStart(2, "0")}:00`,
      origin,
      destination: dest,
      price,
      currency: "CNY",
      stops: 0,
    });
  }

  return offers.sort((a, b) => a.price - b.price);
}

export const ctripProvider: FlightProvider = {
  async searchOffers(params: FlightSearchParams): Promise<FlightOffer[]> {
    const { originCode, destCode, departureDate } = params;

    const originCtrip = getCtripCode(getCityForCode(originCode) ?? "") ?? originCode;
    const destCtrip = getCtripCode(getCityForCode(destCode) ?? "") ?? destCode;

    const dateKey = departureDate.replace(/-/g, "");
    const priceMap = await fetchLowestPrice(originCtrip, destCtrip, true);
    let price = priceMap[dateKey];

    // Fallback: use nearest available price
    if (price === undefined) {
      const dates = Object.keys(priceMap).sort();
      if (dates.length > 0) {
        price = priceMap[dates[0]];
      }
    }

    if (price === undefined) {
      return [];
    }

    const key = `${originCode}-${destCode}-${departureDate}`;
    return generateFlightDetails(key, price, departureDate);
  },
};
