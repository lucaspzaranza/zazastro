import {
  ArabicPart,
  ArabicPartCalculatorDropdownItem,
  ArabicPartsType,
} from "@/interfaces/ArabicPartInterfaces";
import { AspectType } from "@/interfaces/AstroChartInterfaces";
import {
  BirthChart,
  BirthDate,
  FixedStar,
  Planet,
  PlanetType,
  planetTypes,
  ReturnChartType,
} from "@/interfaces/BirthChartInterfaces";
import Image from "next/image";

export const ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT = 10;

export const allSigns = [
  "Áries ♈︎",
  "Touro ♉︎",
  "Gêmeos ♊︎",
  "Câncer ♋︎",
  "Leão ♌︎",
  "Virgem ♍︎",
  "Libra ♎︎",
  "Escorpião ♏︎",
  "Sagitário ♐︎",
  "Capricórnio ♑︎",
  "Aquário ♒︎",
  "Peixes ♓︎",
];

export const signsGlpyphs = [
  "♈︎",
  "♉︎",
  "♊︎",
  "♋︎",
  "♌︎",
  "♍︎",
  "♎︎",
  "♏︎",
  "♐︎",
  "♑︎",
  "♒︎",
  "♓︎",
];

export const monthsNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// mapeamento das siglas das casas angulares
export const angularLabels: Record<number, string> = {
  0: "AC", // Casa 1 – Ascendente
  3: "IC", // Casa 4 – Fundo do Céu
  6: "DC", // Casa 7 – Descendente
  9: "MC", // Casa 10 – Meio do Céu
};

export const caldaicOrder: PlanetType[] = [
  "moon",
  "mercury",
  "venus",
  "sun",
  "mars",
  "jupiter",
  "saturn",
];

export const arabicPartKeys: (keyof ArabicPartsType)[] = [
  "fortune",
  "spirit",
  "necessity",
  "love",
  "valor",
  "victory",
  "captivity",
  "marriage",
  "resignation",
  "children",
];

export function getSign(longitude: number, getGlyphOnly = false): string {
  const signs = [
    `${!getGlyphOnly ? "Áries " : ""}♈︎`,
    `${!getGlyphOnly ? "Touro " : ""}♉︎`,
    `${!getGlyphOnly ? "Gêmeos " : ""}♊︎`,
    `${!getGlyphOnly ? "Câncer " : ""}♋︎`,
    `${!getGlyphOnly ? "Leão " : ""}♌︎`,
    `${!getGlyphOnly ? "Virgem " : ""}♍︎`,
    `${!getGlyphOnly ? "Libra " : ""}♎︎`,
    `${!getGlyphOnly ? "Escorpião " : ""}♏︎`,
    `${!getGlyphOnly ? "Sagitário " : ""}♐︎`,
    `${!getGlyphOnly ? "Capricórnio " : ""}♑︎`,
    `${!getGlyphOnly ? "Aquário " : ""}♒︎`,
    `${!getGlyphOnly ? "Peixes " : ""}♓︎`,
  ];
  return signs[Math.floor(longitude / 30) % 12];
}

export const planesNamesByType: Record<PlanetType, string> = {
  moon: "Lua",
  mercury: "Mercúrio",
  venus: "Vênus",
  sun: "Sol",
  mars: "Marte",
  jupiter: "Júpiter",
  saturn: "Saturno",
  uranus: "Urano",
  neptune: "Netuno",
  pluto: "Plutão",
  northNode: "Nodo Norte",
  southNode: "Nodo Sul",
};

export const fixedNames = {
  antiscionName: "antiscion",
  houseName: "house",
  outerKeyPrefix: "outer",
};

export const arabicPartCalculatorItems: Record<
  string,
  ArabicPartCalculatorDropdownItem[]
> = {
  Ângulos: [
    { name: "AC", type: "house", key: "house-0" },
    { name: "IC", type: "house", key: "house-3" },
    { name: "DC", type: "house", key: "house-6" },
    { name: "MC", type: "house", key: "house-9" },
  ],

  Planetas: [
    { name: "Sol", type: "planet", key: "sun" },
    { name: "Lua", type: "planet", key: "moon" },
    { name: "Mercúrio", type: "planet", key: "mercury" },
    { name: "Vênus", type: "planet", key: "venus" },
    { name: "Marte", type: "planet", key: "mars" },
    { name: "Júpiter", type: "planet", key: "jupiter" },
    { name: "Saturno", type: "planet", key: "saturn" },
  ],

  Casas: [
    { name: "Casa 1 (AC)", type: "house", key: "house-0" },
    { name: "Casa 2", type: "house", key: "house-1" },
    { name: "Casa 3", type: "house", key: "house-2" },
    { name: "Casa 4 (IC)", type: "house", key: "house-3" },
    { name: "Casa 5", type: "house", key: "house-4" },
    { name: "Casa 6", type: "house", key: "house-5" },
    { name: "Casa 7 (DC)", type: "house", key: "house-6" },
    { name: "Casa 8", type: "house", key: "house-7" },
    { name: "Casa 9", type: "house", key: "house-8" },
    { name: "Casa 10 (MC)", type: "house", key: "house-9" },
    { name: "Casa 11", type: "house", key: "house-10" },
    { name: "Casa 12", type: "house", key: "house-11" },
  ],

  "Partes Árabes": [
    { name: "Fortuna", type: "arabicPart", key: "fortune" },
    { name: "Espírito", type: "arabicPart", key: "spirit" },
    { name: "Necessidade", type: "arabicPart", key: "necessity" },
    { name: "Amor", type: "arabicPart", key: "love" },
    { name: "Valor", type: "arabicPart", key: "valor" },
    { name: "Vitória", type: "arabicPart", key: "victory" },
    { name: "Cativeiro", type: "arabicPart", key: "captivity" },
  ],
};

export const getSignGlyphUnicode = (signEmoji: string): string => {
  if (signEmoji === "♈") return "\u2648\uFE0E";
  else if (signEmoji === "♉") return "\u2649\uFE0E";
  else if (signEmoji === "♊") return "\u264A\uFE0E";
  else if (signEmoji === "♋") return "\u264B\uFE0E";
  else if (signEmoji === "♌") return "\u264C\uFE0E";
  else if (signEmoji === "♍") return "\u264D\uFE0E";
  else if (signEmoji === "♎") return "\u264E\uFE0E";
  else if (signEmoji === "♏") return "\u264F\uFE0E";
  else if (signEmoji === "♐") return "\u2650\uFE0E";
  else if (signEmoji === "♑") return "\u2651\uFE0E";
  else if (signEmoji === "♒") return "\u2652\uFE0E";
  else if (signEmoji === "♓") return "\u2653\uFE0E";

  return "\u2648\uFE0E"; // ♈︎
};

export const getSignColor = (signGlyph: string): string => {
  if (signGlyph === "♈︎" || signGlyph === "♌︎" || signGlyph === "♐︎")
    return "red";
  else if (signGlyph === "♉︎" || signGlyph === "♍︎" || signGlyph === "♑︎")
    return "green";
  else if (signGlyph === "♊︎" || signGlyph === "♎︎" || signGlyph === "♒︎")
    return "orange";
  else if (signGlyph === "♋︎" || signGlyph === "♏︎" || signGlyph === "♓︎")
    return "blue";

  return "black";
};

interface ImgOptions {
  size?: number;
  isAntiscion?: boolean;
  isRetrograde?: boolean;
}

export function getPlanetImage(
  planet: PlanetType,
  options: ImgOptions = {
    isAntiscion: false,
    isRetrograde: false,
  }
): React.ReactNode {
  const folder = "planets";
  const { isAntiscion, isRetrograde } = options;
  const path = `/${folder}${isAntiscion ? "/antiscion" : ""}/${planet}${isRetrograde ? "-rx" : ""
    }.png`;
  return (
    <Image
      alt="planet"
      src={path}
      width={options.size ?? 15}
      height={options.size ?? 15}
      unoptimized
    />
  );
}

export function getArabicPartImage(
  lot: ArabicPart,
  options: ImgOptions = {
    isAntiscion: false,
  }
): React.ReactNode {
  const folder = "planets";
  const part = lot.planet ? lot.partKey : "custom-lot";
  const path = `/${folder}${options.isAntiscion ? "/antiscion" : ""
    }/${part}.png`;
  return (
    <Image
      alt="arabicPart"
      src={path}
      width={options.size ?? 15}
      height={options.size ?? 15}
      unoptimized
    />
  );
}

export function getAspectImage(
  aspectType: AspectType,
  size = 15
): React.ReactNode {
  const folder = "aspects";
  // const aspectType = aspect.aspectType;
  const path = `/${folder}/${aspectType}.png`;

  return (
    <Image alt="aspect" src={path} width={size} height={size} unoptimized />
  );
}

export const formatSignColor = (stringWithSign: string): React.ReactNode => {
  const length = stringWithSign.length;
  const sign = getSignGlyphUnicode(stringWithSign[length - 2]);
  const color = getSignColor(sign);
  return (
    <>
      <span>{stringWithSign.slice(0, length - 2)}</span>
      <span style={{ color }}>{sign}</span>
    </>
  );
};

export const mod360 = (n: number) => ((n % 360) + 360) % 360; // garante [0 - 359.99]

/**
 * Gets degrees and minutes inside a sign.
 * @param longitude The longitude value.
 * @returns Example: 124.55 Returns 4°55'♌︎ at 4.55 format.
 */
export function getDegreesInsideASign(longitude: number): number {
  const previousSign = Math.floor(longitude / 30);
  const rest = Number.parseFloat((longitude - previousSign * 30).toFixed(2));
  const degrees = Math.floor(rest);
  const minutes = Number.parseFloat((rest - degrees).toFixed(2));

  return degrees + minutes;
}

/**
 * Returns the formatted longitude value with its corresponding Sign.
 * @param longitude The longitude value to be formatted.
 * @param getGlyphOnly If true, it'll show only the sign glyph without its name.
 * @returns The position at the Zodiac to that longitude.
 */
export function getDegreeAndSign(longitude: number, getGlyphOnly = false) {
  const sign = getSign(longitude, getGlyphOnly);
  const previousSign = Math.floor(longitude / 30);
  const rest = Number.parseFloat((longitude - previousSign * 30).toFixed(2));
  const degrees = Math.floor(rest);
  let minutes = Math.floor((rest - degrees) * 100).toString();

  if (minutes.length === 1) {
    minutes = "0" + minutes;
  }

  const result = `${degrees}°${minutes}'${!getGlyphOnly ? "de " : ""}${sign}`;

  return result;
}

/**
 * Returns minute-based floating point numbers (from 0 to 59).
 * @param decimal - The longitude value in decimal base.
 * @returns The longitude value in minute base.
 */
export function decimalToDegreesMinutes(decimal: number) {
  let degrees = Math.floor(decimal);
  let minutes = Math.floor((decimal - degrees) * 61) / 100; // 61 pra que os números cheguem até 60
  if (minutes === 0.6) {
    // 60 minutos, ou seja: 1 grau
    degrees++;
    minutes = 0;
  }

  const result = degrees + minutes;
  return result;
}

export function getAntiscion(longitude: number, getRaw = false) {
  let result = 0;

  if (longitude < 180) {
    const distance = 90 - longitude;
    result = 90 + distance;
  } else {
    const distance = 270 - longitude;
    result = 270 + distance;
  }

  result = wrapZodiacLongitude(result);

  return getRaw ? result : decimalToDegreesMinutes(result);
}

export function wrapZodiacLongitude(longitude: number) {
  if (longitude < 0) {
    return (longitude += 360);
  } else if (longitude >= 360) {
    return (longitude -= 360);
  }

  return longitude;
}

export function getZodiacRuler(longitude: number) {
  const long = wrapZodiacLongitude(longitude);

  const zodiacRulers: PlanetType[] = [
    "mars", // Aries 0 - 29
    "venus", // Taurus 30 - 59
    "mercury", // Gemini 60 - 89
    "moon", // Cancer 90 - 119
    "sun", // Leo 120 - 149
    "mercury", // Virgo 150 - 179
    "venus", // Libra 180 - 209
    "mars", // Scorpio 210 - 239
    "jupiter", // Sagittarius 240 - 269
    "saturn", // Capricorn 270 - 299
    "saturn", // Aquarius 300 - 329
    "jupiter", // Pisces 330 - 359
  ];

  const index = Math.floor(long / 30);

  return zodiacRulers[index];
}

export function extractHouseNumber(input: string): number | null {
  const match = input.match(/-(0|1[0-2]|[1-9])$/);
  return match ? parseInt(match[1], 10) : null;
}

export function getHourAndMinute(decimalTime: number): string {
  const hours = Math.floor(decimalTime);
  const minutes = Math.floor((decimalTime - hours) * 60);
  const hoursString = hours.toString().padStart(2, "0");
  return `${hoursString}:${minutes}`;
}

export function convertDegMinToDecimal(deg: number, min: number) {
  const decimal = deg + min / 60;
  return parseFloat(decimal.toFixed(4));
}

export function convertDegMinNumberToDecimal(degMin: number) {
  const degrees = Math.floor(degMin);
  const minutes = Number.parseFloat(((degMin - degrees) * 100).toFixed(2));

  const result = degrees + minutes / 60;
  // console.log(
  //   `degMin: ${degMin}, degrees: ${degrees}, minutes: ${minutes}, result: ${result}`
  // );
  return result;
}

/**
 * Returns the longitude within a degThreshold and with [0 - 59] minutes.
 */
export const clampLongitude = (
  rawString: string,
  degThreshold: number
): number => {
  if (rawString.length === 0) return 0;

  const deg = rawString.split(".")[0];
  const min = rawString.split(".")[1];

  let degNumber = deg === undefined ? 0 : Number.parseInt(deg);
  let minNumber = min === undefined ? 0 : Number.parseInt(min.padEnd(2, "0"));
  console.log(`degNumber: ${degNumber}, minNumber: ${minNumber}`);

  if (degNumber < 0) degNumber = 0;
  else if (degNumber > degThreshold) degNumber = degThreshold;

  if (minNumber > 59) minNumber = 59;

  const result = degNumber + minNumber / 100;

  return result;
};

export function getReturnDateRangeString(
  returnTime: string,
  returnType: ReturnChartType
): string {
  const [datePart] = returnTime.split(" ");
  const [targetYear, targetMonth] = datePart.split("-").map(Number);

  if (returnType === "solar") {
    return `${targetYear}/${targetYear + 1}`;
  } else {
    const year = targetYear;
    const month = `${targetMonth.toString().padStart(2, "0")}`;

    let nextMonth: string = (targetMonth + 1).toString().padStart(2, "0");
    let nextMonthYear = year.toString();

    if (nextMonth === "13") {
      nextMonth = "01";
      nextMonthYear = (year + 1).toString();
    }

    return `${month}/${year} - ${nextMonth}/${nextMonthYear}`;
  }
}

export function chartsAreEqual(
  chart: BirthChart,
  chartToCompare: BirthChart
): boolean {
  let result = true;

  for (let index = 0; index < chart.planets.length; index++) {
    const planet = chart.planets[index];
    const planetToCompare = chartToCompare.planets[index];

    const longitudesAreEqual =
      planet.longitudeRaw === planetToCompare.longitudeRaw;
    result = result && longitudesAreEqual;

    if (!result) return false;
  }

  for (let index = 0; index < chart.housesData.house.length; index++) {
    const houseLongitude = chart.housesData.house[index];
    const houseToCompareLongitude = chartToCompare.housesData.house[index];

    const longitudesAreEqual = houseLongitude === houseToCompareLongitude;

    result = result && longitudesAreEqual;

    if (!result) return false;
  }

  return true;
}

export function convertDecimalIntoDegMinString(decimal: number): string {
  const array = decimal.toString().split(".");
  const deg = array[0];
  let min = array[1];

  if (!min) min = "00";
  else if (min.length === 1) min = min.padEnd(2, "0") ?? "";

  return `${deg}°${min}'`;
}

export function makeLunarDerivedChart(data: any, birthDate: BirthDate, targetDate: BirthDate): BirthChart {
  return {
    ...data,
    returnTime: data.returnTime,
    birthDate,
    targetDate,
    planets: data.returnPlanets.map((planet: Planet) => {
      return {
        ...planet,
        longitude: decimalToDegreesMinutes(planet.longitude),
        antiscion: getAntiscion(planet.longitude),

        longitudeRaw: planet.longitude,
        antiscionRaw: getAntiscion(planet.longitude, true),
        type: planetTypes[planet.id],
      };
    }),
    planetsWithSigns: data.returnPlanets.map((planet: Planet) => {
      return {
        position: getDegreeAndSign(
          decimalToDegreesMinutes(planet.longitude),
          true
        ),
        antiscion: getDegreeAndSign(
          getAntiscion(planet.longitude),
          true
        ),
      };
    }),
    housesData: {
      ...data?.returnHousesData,
      housesWithSigns: data.returnHousesData?.house.map(
        (houseLong: number) => {
          return getDegreeAndSign(
            decimalToDegreesMinutes(houseLong),
            true
          );
        }
      ),
    },
    fixedStars: data.fixedStars.map((star: FixedStar) => ({
      ...star,
      elementType: "fixedStar",
      isAntiscion: false,
      isFromOuterChart: false,
      longitudeSign: getDegreeAndSign(
        decimalToDegreesMinutes(star.longitude),
        true
      ),
    })),
  };
}