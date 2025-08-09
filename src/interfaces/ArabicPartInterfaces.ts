import { PlanetType } from "./BirthChartInterfaces";

export interface ArabicPart {
  name: string;
  formulaDescription: string;
  longitude: number;
  longitudeRaw: number;
  longitudeSign: string;
  antiscion: number;
  antiscionRaw: number;
  antiscionSign: string;
  distanceFromASC: number;
  rawDistanceFromASC: number;
  zodiacRuler?: PlanetType;
  planet?: PlanetType;
  partKey: keyof ArabicPartsType;
}

export interface ArabicPartsType {
  fortune?: ArabicPart;
  spirit?: ArabicPart;
  necessity?: ArabicPart;
  love?: ArabicPart;
  valor?: ArabicPart;
  victory?: ArabicPart;
  captivity?: ArabicPart;
  marriage?: ArabicPart;
  resignation?: ArabicPart;
  children?: ArabicPart;
}
