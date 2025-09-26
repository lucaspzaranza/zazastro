import { ChartElement } from "./AstroChartInterfaces";

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
export type ArabicPartType = "birth" | "arch" | "solarReturn" | "sinastry";

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
  coordinates: SelectedCity;
}

export interface BirthChartProfile {
  name?: string;
  id?: string;
  birthDate?: BirthDate;
}

export interface PlanetWithSign {
  position: string;
  antiscion: string;
}

export interface BirthChart {
  planets: Planet[];
  planetsWithSigns?: PlanetWithSign[];
  housesData: HousesData;
  birthDate: BirthDate;
  fixedStars: FixedStar[];

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
  name?: string;
  latitude: number;
  longitude: number;
}

export interface PlanetOverlap {
  thresholdDeg: number;
  baseSymbolOffset: number;
  overlapGap: number;
  planetOrder: number;
}

export interface FixedStar extends ChartElement {
  longitudeSign: string;
  latitude: number;
  magnitude: number;
}
