import { ResolvedChartDate } from "@/hooks/useResolvedChartDate";
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
    useReturnSelectorArrows?: boolean;
    onUpdateAspectsData?: (aspectsData: PlanetAspectData[]) => void;
    dateBlocks?: ResolvedChartDate[];
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
  isRetrograde: boolean;
  isTransit?: boolean;
}

export interface ChartElementForArabicPartCalculation {
  name: string;
  key: string;
  elementType: ElementType;
  longitude: number;
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
  isRetrograde: boolean;
  isRelevant?: boolean;
  isTransit?: boolean;
}

export interface PlanetAspectData {
  aspectType: AspectType;
  key: string;
  element: AspectedElement;
  aspectedElement: AspectedElement;

  elementImg?: React.ReactNode;
  aspectImg?: React.ReactNode;
  aspectedElementImg?: React.ReactNode;
  distance?: string;
  distanceType?: string;
}

export interface ElementOverlapLongitudeAndOffset {
  longitude: number;
  offset: number;
}

export type ElementOverlapPosition =
  | "origin"
  | "backward"
  | "forward"
  | "inward";

export interface ChartElementOverlap {
  element: ChartElement;
  aboveElement?: ChartElementOverlap;
  inwardIndex: number;
  position: ElementOverlapPosition;
}
