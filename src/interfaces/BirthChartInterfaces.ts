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
  | "pluto"
  | "northNode"
  | "southNode";

export type ReturnChartType = "solar" | "lunar";
export type ChartType = "birth" | "return";

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
  "northNode",
  "southNode",
];

export interface BirthDate {
  day: number;
  month: number;
  year: number;
  time: string;
  coordinates: Coordinates;
}

export interface BirthChart {
  planets: Planet[];
  planetsWithSigns?: { position: string; antiscion: string }[];
  housesData: HousesData;
  birthDate: BirthDate;

  // If it is a return chart, these props will be needed
  returnType?: ReturnChartType;
  targetDate?: BirthDate;
  returnTime?: string;
  timezone?: string;
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
  isRetrograde: boolean;
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

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SelectedCity {
  name: string;
  latitude: number;
  longitude: number;
}

export interface PlanetOverlap {
  thresholdDeg: number;
  baseSymbolOffset: number;
  overlapGap: number;
  planetOrder: number;
}
