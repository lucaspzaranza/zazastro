import { ArabicPartsType } from "./ArabicPartInterfaces";
import {
  FixedStar,
  HousesData,
  Planet,
  PlanetType,
} from "./BirthChartInterfaces";

export type OrbCalculationOrientation = "upper" | "lower";

export interface AstroChartProps {
  props: {
    planets?: Planet[];
    housesData?: HousesData;
    arabicParts?: ArabicPartsType;
    outerPlanets?: Planet[];
    outerHouses?: HousesData;
    outerArabicParts?: ArabicPartsType;
    fixedStars?: FixedStar[];
    combineWithBirthChart?: () => void;
    combineWithReturnChart?: () => void;
    onUpdateAspectsData?: (aspectsData: PlanetAspectData[]) => void;
  };
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

export type ElementType = "planet" | "arabicPart" | "house" | "fixedStar";

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
  isAntiscion: boolean;
}

export interface PlanetAspectData {
  aspectType: AspectType;
  key: string;
  element: AspectedElement;
  aspectedElement: AspectedElement;
}
