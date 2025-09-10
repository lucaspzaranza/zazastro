import { PlanetType } from "./BirthChartInterfaces";
import { ElementType } from "./AstroChartInterfaces";

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

export interface ArabicPartCalculatorDropdownItem {
  name: string;
  key: string;
  type: ElementType;
}
