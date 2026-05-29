"use client";

import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import {
  decimalToDegreesMinutes,
  getAntiscion,
  getDegreeAndSign,
  getZodiacRuler,
  mod360,
  wrapZodiacLongitude,
} from "../app/utils/chartUtils";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";

const getGlyphOnly = true;

export function useArabicPartsUtils() {

  const t = useTranslations();
  
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
      partKey: "fortune",
      formulaDescription: {
        projectedFrom: {
          type: "house",
          key: "1"
        },
        significator: {
          type: "planet",
          key: "moon"
        },
        trigger: {
          type: "planet",
          key: "sun"
        },
        signals: "+, -"
      },
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
      partKey: "spirit",
      // formulaDescription: "AC + Sol - Lua",
      formulaDescription: {
        projectedFrom: {
          type: "house",
          key: "1"
        },
        significator: {
          type: "planet",
          key: "sun"
        },
        trigger: {
          type: "planet",
          key: "moon"
        },
        signals: "+, -"
      },
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfNecessity(
    chartData: BirthChart,
    arabicParts: ArabicPartsType
  ): ArabicPart {
    const asc = chartData.housesData.ascendant;

    const lotOfFortune = arabicParts.fortune!;
    const lotOfSpirit = arabicParts!.spirit!;

    const longitudeRaw = wrapZodiacLongitude(
      asc + lotOfFortune.longitudeRaw - lotOfSpirit.longitudeRaw
    );

    return {
      name: "Necessidade",
      planet: "mercury",
      partKey: "necessity",
      // formulaDescription: "AC + Parte da Fortuna - Parte do Espírito",
      formulaDescription: {
        projectedFrom: {
          type: "house",
          key: "1"
        },
        significator: {
          type: "arabicPart",
          key: "fortune"
        },
        trigger: {
          type: "arabicPart",
          key: "spirit"
        },
        signals: "+, -"
      },
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfLove(
    chartData: BirthChart,
    arabicParts: ArabicPartsType
  ): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const lotOfFortune = arabicParts.fortune!;
    const lotOfSpirit = arabicParts.spirit!;

    const longitudeRaw = wrapZodiacLongitude(
      asc + lotOfSpirit.longitudeRaw - lotOfFortune.longitudeRaw
    );

    return {
      name: "Amor",
      planet: "venus",
      partKey: "love",
      // formulaDescription: "AC + Parte do Espírito - Parte da Fortuna",
      formulaDescription: {
        projectedFrom: {
          type: "house",
          key: "1"
        },
        significator: {
          type: "arabicPart",
          key: "spirit"
        },
        trigger: {
          type: "arabicPart",
          key: "fortune"
        },
        signals: "+, -"
      },
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfValor(
    chartData: BirthChart,
    arabicParts: ArabicPartsType
  ): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const lotOfFortune = arabicParts.fortune!;
    const mars = chartData.planets.find((p) => p.type === "mars")!;

    const longitudeRaw = wrapZodiacLongitude(
      asc + lotOfFortune.longitudeRaw - mars.longitudeRaw
    );

    return {
      name: "Valor",
      planet: "mars",
      partKey: "valor",
      // formulaDescription: "AC + Parte da Fortuna - Marte",
      formulaDescription: {
        projectedFrom: {
          type: "house",
          key: "1"
        },
        significator: {
          type: "arabicPart",
          key: "fortune"
        },
        trigger: {
          type: "planet",
          key: "mars"
        },
        signals: "+, -"
      },
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfVictory(
    chartData: BirthChart,
    arabicParts: ArabicPartsType
  ): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const lotOfSpirit = arabicParts.spirit!;
    const jupiter = chartData.planets.find((p) => p.type === "jupiter")!;

    const longitudeRaw = wrapZodiacLongitude(
      asc + jupiter.longitudeRaw - lotOfSpirit.longitudeRaw
    );

    return {
      name: "Vitória",
      planet: "jupiter",
      partKey: "victory",
      // formulaDescription: "AC + Júpiter - Parte do Espírito",
      formulaDescription: {
        projectedFrom: {
          type: "house",
          key: "1"
        },
        significator: {
          type: "planet",
          key: "jupiter"
        },
        trigger: {
          type: "arabicPart",
          key: "spirit"
        },
        signals: "+, -"
      },
      longitudeRaw,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfCaptivity(
    chartData: BirthChart,
    arabicParts: ArabicPartsType
  ): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const lotOfFortune = arabicParts.fortune!;
    const saturn = chartData.planets.find((p) => p.type === "saturn")!;

    const longitudeRaw = wrapZodiacLongitude(
      asc + lotOfFortune.longitudeRaw - saturn.longitudeRaw
    );

    return {
      name: "Cativeiro",
      planet: "saturn",
      partKey: "captivity",
      // formulaDescription: "AC + Parte da Fortuna - Saturno",
      formulaDescription: {
        projectedFrom: {
          type: "house",
          key: "1"
        },
        significator: {
          type: "arabicPart",
          key: "fortune"
        },
        trigger: {
          type: "planet",
          key: "saturn"
        },
        signals: "+, -"
      },
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
      partKey: "marriage",
      // formulaDescription: "AC + DC - Vênus",
      formulaDescription: {
        projectedFrom: {
          type: "house",
          key: "1"
        },
        significator: {
          type: "house",
          key: "7"
        },
        trigger: {
          type: "planet",
          key: "venus"
        },
        signals: "+, -"
      },
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
      partKey: "resignation",
      // formulaDescription: "Saturno + Júpiter - Sol",
      formulaDescription: {
        projectedFrom: {
          type: "planet",
          key: "saturn"
        },
        significator: {
          type: "planet",
          key: "jupiter"
        },
        trigger: {
          type: "planet",
          key: "sun"
        },
        signals: "+, -"
      },
      longitudeRaw,
      zodiacRuler,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateLotOfChildren(chartData: BirthChart): ArabicPart {
    const asc = chartData.housesData.ascendant;
    const saturn = chartData.planets.find((p) => p.type === "saturn")!;
    const jupiter = chartData.planets.find((p) => p.type === "jupiter")!;

    const longitudeRaw = wrapZodiacLongitude(
      asc + saturn.longitudeRaw - jupiter.longitudeRaw
    );
    const longitude = decimalToDegreesMinutes(longitudeRaw);
    const zodiacRuler = getZodiacRuler(longitude);

    return {
      name: "Filhos",
      partKey: "children",
      // formulaDescription: "AC + Saturno - Júpiter",
      formulaDescription: {
        projectedFrom: {
          type: "house",
          key: "1"
        },
        significator: {
          type: "planet",
          key: "saturn"
        },
        trigger: {
          type: "planet",
          key: "jupiter"
        },
        signals: "+, -"
      },
      longitudeRaw,
      zodiacRuler,
      ...getArabicPartData(longitudeRaw, asc),
    };
  }

  function calculateBirthArchArabicPart(
    arabicPart: ArabicPart,
    ascendant: number
  ): ArabicPart {
    const asc = ascendant;
    const longitudeRaw = mod360(asc + arabicPart.rawDistanceFromASC);
    const arabicPartData = getArabicPartData(longitudeRaw, ascendant);

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
    getDistanceFromAscendant,
    getArabicPartData,
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
    calculateBirthArchArabicPart
  }
}

