import { AspectedElement } from "@/interfaces/AstroChartInterfaces";
import { arabicPartKeys, caldaicOrder } from "./chartUtils";

export const planets: AspectedElement[] = caldaicOrder.map((planet) => ({
  name: planet,
  elementType: "planet",
  isAntiscion: false,
  isFromOuterChart: false,
  longitude: 0,
  isRetrograde: false,
}));

export const planetsAntiscion = planets.map((planet) => ({
  ...planet,
  isAntiscion: true,
}));

export const outerPlanets: AspectedElement[] = [
  ...planets.map((planet) => ({ ...planet, isFromOuterChart: true })),
];

export const outerPlanetsAntiscion: AspectedElement[] = [
  ...planetsAntiscion.map((planet) => ({
    ...planet,
    isFromOuterChart: true,
    isAntiscion: true,
  })),
];

export const arabicParts: AspectedElement[] = arabicPartKeys
  .slice(0, 7)
  .map((key) => ({
    name: key,
    elementType: "arabicPart",
    isAntiscion: false,
    isFromOuterChart: false,
    longitude: 0,
    isRetrograde: false,
  }));

export const arabicPartsAntiscion = arabicParts.map((part) => ({
  ...part,
  isAntiscion: true,
}));

export const outerArabicParts: AspectedElement[] = [
  ...arabicParts.map((lot) => ({ ...lot, isFromOuterChart: true })),
];

export const outerArabicPartsAntiscion: AspectedElement[] = [
  ...arabicPartsAntiscion.map((lot) => ({
    ...lot,
    isFromOuterChart: true,
    isAntiscion: true,
  })),
];

export const housesNames: string[] = [
  "house-0",
  "house-1",
  "house-2",
  "house-3",
  "house-4",
  "house-5",
  "house-6",
  "house-7",
  "house-8",
  "house-9",
  "house-10",
  "house-11",
];

export const houses: AspectedElement[] = housesNames.map((name) => ({
  name,
  elementType: "house",
  isAntiscion: false,
  isFromOuterChart: false,
  longitude: 0,
  isRetrograde: false,
}));

export const outerHouses: AspectedElement[] = [
  ...houses.map((house) => ({ ...house, isFromOuterChart: true })),
];

export const fixedStar: AspectedElement = {
  elementType: "fixedStar",
  isAntiscion: false,
  isFromOuterChart: false,
  longitude: 0,
  name: "Estrelas Fixas",
  isRetrograde: false,
};

export const allElements: AspectedElement[] = [
  ...planets,
  ...arabicParts,
  ...planetsAntiscion,
  ...arabicPartsAntiscion,
  ...houses,
  ...outerPlanets,
  ...outerArabicParts,
  ...outerPlanetsAntiscion,
  ...outerArabicPartsAntiscion,
  ...outerHouses,
  fixedStar,
];
