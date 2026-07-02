export interface FlightSearchParams {
  originCode: string;
  destCode: string;
  departureDate: string; // YYYY-MM-DD
  currency?: string;
}

export interface FlightOffer {
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  price: number;
  currency: string;
  stops: number;
}

export interface FlightProvider {
  searchOffers(params: FlightSearchParams): Promise<FlightOffer[]>;
}
