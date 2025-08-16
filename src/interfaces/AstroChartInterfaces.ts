import { ArabicPartsType } from "./ArabicPartInterfaces";
import { HousesData, Planet, PlanetType } from "./BirthChartInterfaces";

export interface AstroChartProps {
  planets: Planet[];
  housesData: HousesData;
  arabicParts?: ArabicPartsType;
  outerPlanets?: Planet[];
  outerHouses?: HousesData;
  outerArabicParts?: ArabicPartsType;
  combineWithBirthChart?: () => void;
  combineWithReturnChart?: () => void;
}

export interface ChartElement {
  longitude: number;
  name: string;
  id: number;
  isAntiscion: boolean;
  elementType: ElementType;
  planetType?: PlanetType;
  isFromOuterChart: boolean;
}

export type ElementType = "planet" | "arabicPart" | "house";

export type AspectType =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition";

export interface Aspect {
  type: AspectType;
  angle: number;
}

export interface AspectDataItem {
  aspect: AspectType;
  elementsWithAspect: ChartElement[];
}

export interface AspectedElement {
  name: string;
  longitude: number;
  elementType: ElementType;
  isFromOuterChart: boolean;
}

export interface PlanetAspectData {
  aspectType: AspectType;
  key: string;
  element: AspectedElement;
  aspectedElement: AspectedElement;
}
