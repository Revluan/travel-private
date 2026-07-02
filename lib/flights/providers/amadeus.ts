import { env } from "@/lib/env";
import type { FlightOffer, FlightProvider, FlightSearchParams } from "./types";

const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const res = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.AMADEUS_API_KEY ?? "",
      client_secret: env.AMADEUS_API_SECRET ?? "",
    }),
  });

  if (!res.ok) {
    throw new Error(`Amadeus auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return tokenCache.accessToken;
}

interface AmadeusFlightOffer {
  itineraries: Array<{
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }>;
  }>;
  price: {
    grandTotal: string;
    currency: string;
  };
}

function mapOffer(offer: AmadeusFlightOffer): FlightOffer {
  const seg = offer.itineraries[0]?.segments[0];
  const lastSeg = offer.itineraries[0]?.segments[offer.itineraries[0].segments.length - 1];
  return {
    airline: seg?.carrierCode ?? "??",
    flightNumber: `${seg?.carrierCode ?? ""}${seg?.number ?? ""}`,
    departureTime: seg?.departure?.at ?? "",
    arrivalTime: lastSeg?.arrival?.at ?? "",
    origin: seg?.departure?.iataCode ?? "",
    destination: lastSeg?.arrival?.iataCode ?? "",
    price: Number(offer.price.grandTotal),
    currency: offer.price.currency,
    stops: offer.itineraries[0]?.segments.length - 1,
  };
}

export const amadeusProvider: FlightProvider = {
  async searchOffers(params: FlightSearchParams): Promise<FlightOffer[]> {
    const token = await getAccessToken();
    const searchParams = new URLSearchParams({
      originLocationCode: params.originCode,
      destinationLocationCode: params.destCode,
      departureDate: params.departureDate,
      adults: "1",
      currencyCode: params.currency ?? "CNY",
      max: "5",
    });

    const res = await fetch(
      `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${searchParams}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Amadeus flight search failed: ${res.status} ${body}`);
    }

    const data = await res.json();
    return (data.data as AmadeusFlightOffer[]).map(mapOffer);
  },
};
