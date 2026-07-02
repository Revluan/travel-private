import ctripCodes from "./ctrip-codes.json";

const codeMap = ctripCodes as Record<string, string>;

export function getCtripCode(cityName: string): string | undefined {
  return codeMap[cityName];
}
