"use client";

import { ArabicPart } from "@/interfaces/ArabicPartInterfaces";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import {
  wrapZodiacLongitude,
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

const getGlyphOnly = true;

function getArabicPartData(longitudeRaw: number, asc: number) {
  const longitude = decimalToDegreesMinutes(longitudeRaw);
  const antiscion = getAntiscion(longitudeRaw);
  const antiscionRaw = getAntiscion(longitudeRaw, true);
  const distanceFromASC = getDistanceFromAscendant(longitudeRaw, asc);
  const rawDistanceFromASC = wrapZodiacLongitude(longitudeRaw - asc);

  const longitudeSign = getDegreeAndSign(longitude, getGlyphOnly);
  const antiscionSign = getDegreeAndSign(antiscion, getGlyphOnly);

  return {
    longitude,
    antiscion,
    antiscionRaw,
    distanceFromASC,
    rawDistanceFromASC,
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

    const longitudeRaw = wrapZodiacLongitude(
      asc + moon.longitudeRaw - sun.longitudeRaw
    );

    return {
      name: "Fortuna",
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

    const longitudeRaw = wrapZodiacLongitude(
      asc + sun.longitudeRaw - moon.longitudeRaw
    );

    return {
      name: "Espírito",
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

    const longitudeRaw = wrapZodiacLongitude(
      asc + lotOfFortune.longitudeRaw - lotOfSpirit.longitudeRaw
    );

    return {
      name: "Necessidade",
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

    const longitudeRaw = wrapZodiacLongitude(
      asc + lotOfSpirit.longitudeRaw - lotOfFortune.longitudeRaw
    );

    return {
      name: "Amor",
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

    const longitudeRaw = wrapZodiacLongitude(
      asc + lotOfFortune.longitudeRaw - mars.longitudeRaw
    );

    return {
      name: "Valor",
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

    const longitudeRaw = wrapZodiacLongitude(
      asc + jupiter.longitudeRaw - lotOfSpirit.longitudeRaw
    );

    return {
      name: "Vitória",
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

    const longitudeRaw = wrapZodiacLongitude(
      asc + lotOfFortune.longitudeRaw - saturn.longitudeRaw
    );

    return {
      name: "Cativeiro",
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

    const longitudeRaw = wrapZodiacLongitude(asc + dsc - venus.longitudeRaw);
    const longitude = decimalToDegreesMinutes(longitudeRaw);
    const zodiacRuler = getZodiacRuler(longitude);

    return {
      name: "Casamento",
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

    const longitudeRaw = wrapZodiacLongitude(
      saturn.longitudeRaw + jupiter.longitudeRaw - sun.longitudeRaw
    );
    const longitude = decimalToDegreesMinutes(longitudeRaw);
    const zodiacRuler = getZodiacRuler(longitude);

    return {
      name: "Renúncia",
      formulaDescription: "Saturno + Júpiter - Sol",
      longitudeRaw,
      zodiacRuler,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfChildren(chartData: BirthChart): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const saturn = chartData.planets.find((p) => p.type === "saturn")!;
    const jupiter = chartData.planets.find((p) => p.type === "jupiter")!;
    // const sun = chartData.planets.find((p) => p.type === "sun")!;

    const longitudeRaw = wrapZodiacLongitude(
      asc + saturn.longitudeRaw - jupiter.longitudeRaw
    );
    const longitude = decimalToDegreesMinutes(longitudeRaw);
    const zodiacRuler = getZodiacRuler(longitude);

    return {
      name: "Filhos",
      formulaDescription: "AC + Saturno - Júpiter",
      longitudeRaw,
      zodiacRuler,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateBirthArchArabicPart(
    arabicPart: ArabicPart,
    // chart: BirthChart
    ascendant: number
  ): ArabicPart {
    // const asc = chart.housesData.ascendant;
    const asc = ascendant;
    const longitudeRaw = asc + arabicPart.rawDistanceFromASC;
    const arabicPartData = getArabicPartData(
      longitudeRaw,
      // chart.housesData.ascendant
      ascendant
    );

    // console.log(
    //   `Parte: ${arabicPart.name}, Distância do AC (cru): ${
    //     arabicPart.rawDistanceFromASC
    //   },
    //   longitudeRaw: ${longitudeRaw}, transformada: ${
    //     arabicPartData.longitudeSign
    //   },
    //   AC da Revolução (cru): ${asc},
    //   AC da Revolução: ${getDegreeAndSign(decimalToDegreesMinutes(asc))},
    //   Antiscion: ${arabicPartData.antiscion};
    //   Antiscion (cru): ${arabicPartData.antiscionRaw},
    //   Signo do Antiscion: ${arabicPartData.antiscionSign}`
    // );

    return {
      ...arabicPart,
      longitudeRaw,
      ...arabicPartData,
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
    calculateLotOfChildren,
    calculateBirthArchArabicPart,
  };
}
