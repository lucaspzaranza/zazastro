import { ChartMenuType } from "@/contexts/ChartMenuContext";
import { ChartElement } from "./AstroChartInterfaces";

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
  | "pluto"
  | "northNode"
  | "southNode";

export type ReturnChartType = "solar" | "lunar";
export type ChartType = "birth" | "return" | "sinastry" | "progression" | "lunarDerived" | "profection" | "transits";
export type ArabicPartType = "birth" | "arch" | "solarReturn" | "sinastry" | "custom";
export type GenderType = "male" | "female" | "event";

export type Sign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

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
  "northNode",
  "southNode",
];

export interface BirthDate {
  day: number;
  month: number;
  year: number;
  time: string;
  coordinates: SelectedCity;
  houseSystem?: string;
}

export interface BirthChartProfile {
  name?: string;
  id?: string;
  birthDate?: BirthDate;
  chartMenu?: ChartMenuType
  transitsDate?: BirthDate;
  gender?: GenderType;
}

export interface TransitsChartFormData {
  profile: BirthChartProfile
  transitsDate: BirthDate;
}

export interface PlanetWithSign {
  position: string;
  antiscion: string;
}

export interface BirthChart {
  planets: Planet[];
  planetsWithSigns?: PlanetWithSign[];
  housesData: HousesData;
  birthDate: BirthDate;
  fixedStars: FixedStar[];
  isDiurnal?: boolean;

  // If it is a return chart, these props will be needed
  returnType?: ReturnChartType;
  targetDate?: BirthDate;
  returnTime?: string;
  timezone?: string;
  transits?: Transits;
}

export interface Transits {
  planets: Planet[];
  planetsWithSigns?: PlanetWithSign[];
  date: BirthDate;
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
  isRetrograde: boolean;
  isTransit: boolean;
}

export interface HousesData {
  house: number[];
  housesWithSigns: string[] | undefined;
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  kochCoAscendant: number;
  munkaseyCoAscendant: number;
  munkaseyPolarAscendant: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SelectedCity {
  name?: string;
  latitude: number;
  longitude: number;
}

export interface PlanetOverlap {
  thresholdDeg: number;
  baseSymbolOffset: number;
  overlapGap: number;
  planetOrder: number;
}

export interface FixedStar extends ChartElement {
  longitudeSign: string;
  latitude: number;
  magnitude: number;
  isRelevant: boolean;
}

export interface ChatDateProps {
  chartType: ChartType;
  label?: string;
  birthChart?: BirthChart;
  chartDate?: BirthDate;
}

export interface TermOrDecan {
  start: number; // inclusive
  end: number;   // exclsive
  ruler: PlanetType;
}