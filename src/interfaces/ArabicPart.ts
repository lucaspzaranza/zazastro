import { PlanetType } from "./BirthChart";

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
  zodiacRuler?: PlanetType;
  planet?: PlanetType;
}

export interface ArabicParts {
  fortune?: ArabicPart;
  spirit?: ArabicPart;
  necessity?: ArabicPart;
  love?: ArabicPart;
  valor?: ArabicPart;
  victory?: ArabicPart;
  captivity?: ArabicPart;
  marriage?: ArabicPart;
  resignation?: ArabicPart;
}
