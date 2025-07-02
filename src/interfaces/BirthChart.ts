export interface BirthChart {
  planets: Planet[];
  planetsWithSigns: { position: string; antiscion: string }[];
  housesData: HousesData;
}

export interface Planet {
  name: string;
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

export interface ArabicPart {
  name: string;
  position: number;
  distanceFromASC: number;
  antiscion: number;
  antiscionSign: string;
}
