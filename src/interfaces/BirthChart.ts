export type PlanetType =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type ReturnChartType = "solar" | "lunar";

export const planetTypes: PlanetType[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

export interface BirthDate {
  day: number;
  month: number;
  year: number;
  time: string;
}

export interface BirthChart {
  planets: Planet[];
  planetsWithSigns?: { position: string; antiscion: string }[];
  housesData: HousesData;
  birthDate: BirthDate;

  // If it is a return chart, these props will be needed
  returnType?: ReturnChartType;
  targetDate?: BirthDate;
}

export interface Planet {
  name: string;
  type: PlanetType;
  id: number;
  longitude: number;
  longitudeRaw: number;
  sign: string;
  antiscion: number;
  antiscionRaw: number;
}

export interface HousesData {
  house: number[];
  housesWithSigns: string[] | undefined;
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  kochCoAscendant: number;
  munkaseyCoAscendant: number;
  munkaseyPolarAscendant: number;
}
