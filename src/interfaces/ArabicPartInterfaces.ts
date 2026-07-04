import { PlanetType } from "./BirthChartInterfaces";
import { ChartElement, ElementType } from "./AstroChartInterfaces";

export interface ArabicPart {
  name: string;
  formulaDescription?: FormulaDescription;
  alternativeFormulaDescription?: FormulaDescription;
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

export type ConditionType = "male" | "female" | "day" | "night";

export interface FormulaDescription {
  projectedFromA: FormulaElement;
  significatorB: FormulaElement;
  triggerC: FormulaElement;
  signals: string;
  condition?: ConditionType[];
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
  marriageHermes?: ArabicPart;
  marriageValens?: ArabicPart;
  custom?: ArabicPart;
}

export interface ArabicPartCalculatorDropdownItem {
  name: string;
  key: string;
  type: ElementType;
}
