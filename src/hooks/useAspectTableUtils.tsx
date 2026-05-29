"use client";

import { AspectedElement } from "@/interfaces/AstroChartInterfaces";
import { arabicPartKeys, caldaicOrder } from "../app/utils/chartUtils";

export function useAspectTableUtils() {
  const planets: AspectedElement[] = caldaicOrder.map((planet) => ({
    name: planet,
    elementType: "planet",
    isAntiscion: false,
    isFromOuterChart: false,
    longitude: 0,
    isRetrograde: false,
  }));

  const planetsAntiscion = planets.map((planet) => ({
    ...planet,
    isAntiscion: true,
  }));

  const outerPlanets: AspectedElement[] = [
    ...planets.map((planet) => ({ ...planet, isFromOuterChart: true })),
  ];

  const outerPlanetsAntiscion: AspectedElement[] = [
    ...planetsAntiscion.map((planet) => ({
      ...planet,
      isFromOuterChart: true,
      isAntiscion: true,
    })),
  ];

  const arabicParts: AspectedElement[] = arabicPartKeys
    .slice(0, 7)
    .map((key) => ({
      name: key,
      elementType: "arabicPart",
      isAntiscion: false,
      isFromOuterChart: false,
      longitude: 0,
      isRetrograde: false,
    }));

  const arabicPartsAntiscion = arabicParts.map((part) => ({
    ...part,
    isAntiscion: true,
  }));

  const outerArabicParts: AspectedElement[] = [
    ...arabicParts.map((lot) => ({ ...lot, isFromOuterChart: true })),
  ];

  const outerArabicPartsAntiscion: AspectedElement[] = [
    ...arabicPartsAntiscion.map((lot) => ({
      ...lot,
      isFromOuterChart: true,
      isAntiscion: true,
    })),
  ];

  const housesIndexes: string[] = [
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

  const houses: AspectedElement[] = housesIndexes.map((name, index) => ({
    name,
    elementType: "house",
    isAntiscion: false,
    isFromOuterChart: false,
    longitude: 0,
    isRetrograde: false,
  }));

  const outerHouses: AspectedElement[] = [
    ...houses.map((house) => ({ ...house, isFromOuterChart: true })),
  ];

  const fixedStar: AspectedElement = {
    elementType: "fixedStar",
    isAntiscion: false,
    isFromOuterChart: false,
    longitude: 0,
    name: "Estrelas Fixas",
    isRetrograde: false,
  };

  const allElements: AspectedElement[] = [
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

  return {
    planets,
    arabicParts,
    planetsAntiscion,
    arabicPartsAntiscion,
    houses,
    outerPlanets,
    outerArabicParts,
    outerPlanetsAntiscion,
    outerArabicPartsAntiscion,
    outerHouses,
    fixedStar,
    allElements
  }
}