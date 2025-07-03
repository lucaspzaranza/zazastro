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

export interface BirthChart {
  planets: Planet[];
  planetsWithSigns: { position: string; antiscion: string }[];
  housesData: HousesData;
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
  housesWithSigns: string[];
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  kochCoAscendant: number;
  munkaseyCoAscendant: number;
  munkaseyPolarAscendant: number;
}
