import type { FlightOffer, FlightProvider, FlightSearchParams } from "./types";

// Deterministic pseudo-random based on input string
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

// Base prices between major hub pairs (for relative distance estimation)
const HUB_DISTANCE: Record<string, number> = {
  SHA: 0, PVG: 0,
  PEK: 1100, PKX: 1100,
  CAN: 1300, SZX: 1300,
  CTU: 1700, TFU: 1700,
  CKG: 1500,
  KMG: 2100,
  XIY: 1300,
  WUH: 700,
  CSX: 900,
  HGH: 160,
  NKG: 270,
  HAK: 1800,
  SYX: 1900,
  XMN: 800,
  URC: 3300,
  KWE: 1500,
  HET: 1400,
  SHE: 1200,
  DLC: 900,
  TSN: 1000,
};

function estimateDistance(origin: string, dest: string): number {
  if (HUB_DISTANCE[dest] !== undefined) return HUB_DISTANCE[dest];
  return 1000;
}

const BASE_PRICE_PER_KM = 0.4;
const MIN_PRICE = 200;

function basePriceForRoute(origin: string, dest: string): number {
  const dist = estimateDistance(origin, dest);
  return Math.max(MIN_PRICE, Math.round(dist * BASE_PRICE_PER_KM));
}

export const mockProvider: FlightProvider = {
  async searchOffers(params: FlightSearchParams): Promise<FlightOffer[]> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));

    const key = `${params.originCode}-${params.destCode}-${params.departureDate}`;
    const seed = hashStr(key);
    const rand = seededRandom(seed);

    const count = 2 + Math.floor(rand() * 4); // 2-5 flights
    const basePrice = basePriceForRoute(params.originCode, params.destCode);

    const offers: FlightOffer[] = [];
    const usedAirlines = new Set<number>();

    for (let i = 0; i < count; i++) {
      let airlineIdx = Math.floor(rand() * AIRLINES.length);
      while (usedAirlines.has(airlineIdx) && usedAirlines.size < AIRLINES.length) {
        airlineIdx = (airlineIdx + 1) % AIRLINES.length;
      }
      usedAirlines.add(airlineIdx);
      const airline = AIRLINES[airlineIdx];

      const priceVariation = 0.7 + rand() * 0.6;
      const price = Math.round(basePrice * priceVariation);

      const depHour = 6 + Math.floor(rand() * 16);
      const depMin = [0, 15, 30, 45][Math.floor(rand() * 4)];
      const durationMin = 60 + Math.floor(rand() * 180);
      const arrHour = depHour + Math.floor((depMin + durationMin) / 60);
      const arrMin = (depMin + durationMin) % 60;

      const flightNum = 1000 + Math.floor(rand() * 9000);

      const depDate = params.departureDate;
      const arrDate = depHour + Math.floor(durationMin / 60) >= 24
        ? new Date(new Date(depDate).getTime() + 86400000).toISOString().slice(0, 10)
        : depDate;

      offers.push({
        airline: airline.name,
        flightNumber: `${airline.code}${flightNum}`,
        departureTime: `${depDate}T${String(depHour % 24).padStart(2, "0")}:${String(depMin).padStart(2, "0")}:00`,
        arrivalTime: `${arrDate}T${String(arrHour % 24).padStart(2, "0")}:${String(arrMin).padStart(2, "0")}:00`,
        origin: params.originCode,
        destination: params.destCode,
        price,
        currency: params.currency ?? "CNY",
        stops: 0,
      });
    }

    offers.sort((a, b) => a.price - b.price);
    return offers;
  },
};
