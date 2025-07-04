"use client";

import { ArabicPart } from "@/interfaces/ArabicPart";
import { BirthChart } from "@/interfaces/BirthChart";
import {
  clampZodiacLongitude,
  decimalToDegreesMinutes,
  getAntiscion,
  getDegreeAndSign,
  getZodiacRuler,
} from "@/utils/chartUtils";
import { useArabicParts } from "@/contexts/ArabicPartsContext";

function getDistanceFromAscendant(
  longitudeRaw: number,
  ascendant: number
): number {
  let distance = decimalToDegreesMinutes(longitudeRaw - ascendant);

  if (distance < 0) {
    distance += 360;
  } else if (distance >= 360) {
    distance -= 360;
  }

  return distance;
}

function getArabicPartData(longitudeRaw: number, asc: number) {
  const longitude = decimalToDegreesMinutes(longitudeRaw);
  const antiscion = getAntiscion(longitudeRaw);
  const antiscionRaw = getAntiscion(longitudeRaw, true);
  const distanceFromASC = getDistanceFromAscendant(longitudeRaw, asc);

  const longitudeSign = getDegreeAndSign(longitude);
  const antiscionSign = getDegreeAndSign(antiscion);

  return {
    longitude,
    antiscion,
    antiscionRaw,
    distanceFromASC,
    longitudeSign,
    antiscionSign,
  };
}

export function useArabicPartCalculations() {
  const { arabicParts } = useArabicParts();

  function calculateLotOfFortune(chartData: BirthChart): ArabicPart {
    const sun = chartData.planets.find((p) => p.type === "sun")!;
    const moon = chartData.planets.find((p) => p.type === "moon")!;
    const asc = chartData.housesData.ascendant;

    const longitudeRaw = clampZodiacLongitude(
      asc + moon.longitudeRaw - sun.longitudeRaw
    );

    return {
      name: "Parte da Fortuna",
      planet: "moon",
      formulaDescription: "ASC + Lua - Sol",
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfSpirit(chartData: BirthChart): ArabicPart {
    const sun = chartData.planets.find((p) => p.type === "sun")!;
    const moon = chartData.planets.find((p) => p.type === "moon")!;
    const asc = chartData.housesData.ascendant;

    const longitudeRaw = clampZodiacLongitude(
      asc + sun.longitudeRaw - moon.longitudeRaw
    );

    return {
      name: "Parte do Espírito",
      planet: "sun",
      formulaDescription: "ASC + Sol - Lua",
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfNecessity(chartData: BirthChart): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const lotOfFortune = arabicParts?.fortune!;
    const lotOfSpirit = arabicParts?.spirit!;

    const longitudeRaw = clampZodiacLongitude(
      asc + lotOfFortune.longitudeRaw - lotOfSpirit.longitudeRaw
    );

    return {
      name: "Parte da Necessidade",
      planet: "mercury",
      formulaDescription: "ASC + Parte da Fortuna - Parte do Espírito",
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfLove(chartData: BirthChart): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const lotOfFortune = arabicParts?.fortune!;
    const lotOfSpirit = arabicParts?.spirit!;

    const longitudeRaw = clampZodiacLongitude(
      asc + lotOfSpirit.longitudeRaw - lotOfFortune.longitudeRaw
    );

    return {
      name: "Parte do Amor",
      planet: "venus",
      formulaDescription: "ASC + Parte do Espírito - Parte da Fortuna",
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfValor(chartData: BirthChart): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const lotOfFortune = arabicParts?.fortune!;
    const mars = chartData.planets.find((p) => p.type === "mars")!;

    const longitudeRaw = clampZodiacLongitude(
      asc + lotOfFortune.longitudeRaw - mars.longitudeRaw
    );

    return {
      name: "Parte do Valor",
      planet: "mars",
      formulaDescription: "ASC + Parte da Fortuna - Marte",
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfVictory(chartData: BirthChart): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const lotOfSpirit = arabicParts?.spirit!;
    const jupiter = chartData.planets.find((p) => p.type === "jupiter")!;

    const longitudeRaw = clampZodiacLongitude(
      asc + jupiter.longitudeRaw - lotOfSpirit.longitudeRaw
    );

    return {
      name: "Parte da Vitória",
      planet: "jupiter",
      formulaDescription: "ASC + Júpiter - Parte do Espírito",
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfCaptivity(chartData: BirthChart): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const lotOfFortune = arabicParts?.fortune!;
    const saturn = chartData.planets.find((p) => p.type === "saturn")!;

    const longitudeRaw = clampZodiacLongitude(
      asc + lotOfFortune.longitudeRaw - saturn.longitudeRaw
    );

    return {
      name: "Parte do Cativeiro",
      planet: "saturn",
      formulaDescription: "ASC + Parte da Fortuna - Saturno",
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfMarriage(chartData: BirthChart): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const dsc = chartData.housesData.house[6];
    const venus = chartData.planets.find((p) => p.type === "venus")!;

    const longitudeRaw = clampZodiacLongitude(asc + dsc - venus.longitudeRaw);
    const longitude = decimalToDegreesMinutes(longitudeRaw);
    const zodiacRuler = getZodiacRuler(longitude);

    return {
      name: "Parte do Casamento",
      formulaDescription: "ASC + DSC - Vênus",
      longitudeRaw,
      zodiacRuler,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfResignation(chartData: BirthChart): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const saturn = chartData.planets.find((p) => p.type === "saturn")!;
    const jupiter = chartData.planets.find((p) => p.type === "jupiter")!;
    const sun = chartData.planets.find((p) => p.type === "sun")!;

    const longitudeRaw = clampZodiacLongitude(
      saturn.longitudeRaw + jupiter.longitudeRaw - sun.longitudeRaw
    );
    const longitude = decimalToDegreesMinutes(longitudeRaw);
    const zodiacRuler = getZodiacRuler(longitude);

    return {
      name: "Parte da Renúncia",
      formulaDescription: "Saturno + Júpiter - Sol",
      longitudeRaw,
      zodiacRuler,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  return {
    calculateLotOfFortune,
    calculateLotOfSpirit,
    calculateLotOfNecessity,
    calculateLotOfLove,
    calculateLotOfValor,
    calculateLotOfVictory,
    calculateLotOfCaptivity,
    calculateLotOfMarriage,
    calculateLotOfResignation,
  };
}
