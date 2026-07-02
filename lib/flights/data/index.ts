import airportsData from "./airports.json";

interface Airport {
  city: string;
  code: string;
  name: string;
  commonConnections: string[];
}

interface Province {
  name: string;
  shortName: string;
  airports: Airport[];
}

interface AirportsData {
  provinces: Record<string, Province>;
}

const data = airportsData as unknown as AirportsData;

export function getAirportsByProvince(provinceNameOrCode: string): Airport[] {
  const province = findByProvinceKey(provinceNameOrCode);
  return province ? province.airports : [];
}

export function getCityCodes(cityName: string): string[] {
  const codes: string[] = [];
  for (const province of Object.values(data.provinces)) {
    for (const airport of province.airports) {
      if (airport.city === cityName && !codes.includes(airport.code)) {
        codes.push(airport.code);
      }
    }
  }
  return codes;
}

export function getAirportByCode(code: string): Airport | undefined {
  for (const province of Object.values(data.provinces)) {
    for (const airport of province.airports) {
      if (airport.code === code.toUpperCase()) {
        return airport;
      }
    }
  }
  return undefined;
}

export function getProvinceForCode(code: string): string | undefined {
  const upper = code.toUpperCase();
  for (const [, province] of Object.entries(data.provinces)) {
    for (const airport of province.airports) {
      if (airport.code === upper) {
        return province.shortName;
      }
    }
  }
  return undefined;
}

export function getCityForCode(code: string): string | undefined {
  return getAirportByCode(code.toUpperCase())?.city;
}

export function getAllProvinces(): { code: string; name: string; shortName: string; airportCount: number }[] {
  return Object.entries(data.provinces).map(([code, province]) => ({
    code,
    name: province.name,
    shortName: province.shortName,
    airportCount: province.airports.length,
  }));
}

function findByProvinceKey(nameOrCode: string): Province | undefined {
  if (data.provinces[nameOrCode]) {
    return data.provinces[nameOrCode];
  }
  for (const [, province] of Object.entries(data.provinces)) {
    if (province.shortName === nameOrCode || province.name === nameOrCode) {
      return province;
    }
  }
  return undefined;
}
