import { PlanetType } from "./BirthChartInterfaces";
import { ChartElement, ElementType } from "./AstroChartInterfaces";

export interface ArabicPart {
  name: string;
  formulaDescription?: FormulaDescription;
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
  isFromOuterChart?: boolean;
}

export interface FormulaElement {
  type: ElementType
  key: string
}

export interface FormulaDescription {
  projectedFrom: FormulaElement,
  significator: FormulaElement,
  trigger: FormulaElement,
  signals: string
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
  custom?: ArabicPart;
}

export interface ArabicPartCalculatorDropdownItem {
  name: string;
  key: string;
  type: ElementType;
}
