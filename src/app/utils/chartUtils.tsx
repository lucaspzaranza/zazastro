import {
  ArabicPart,
  ArabicPartCalculatorDropdownItem,
  ArabicPartsType,
} from "@/interfaces/ArabicPartInterfaces";
import { AdvanceChartUnitType, AspectType } from "@/interfaces/AstroChartInterfaces";
import {
  ArabicPartType,
  BirthChart,
  BirthDate,
  FixedStar,
  GenderType,
  Planet,
  PlanetType,
  planetTypes,
  ReturnChartType,
  Sign,
  TermOrDecan,
  Transits,
} from "@/interfaces/BirthChartInterfaces";
import { HouseSystem } from "@/types/HouseSystem";
import Image from "next/image";
import { CHALDEAN_DECANS } from "./termsAndDecans";

export const signsKeys = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces"
]

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

export const unitsArray: AdvanceChartUnitType[] = 
  ["minutes", "hours", "days", "weeks", "months", "years"];

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
  "uranus",
  "neptune",
  "pluto",
  "northNode",
  "southNode",
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
  "marriageHermes",
  "marriageValens",
  "resignation",
  "children",
  "custom"
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

export const HOUSE_SYSTEMS: Record<HouseSystem, string> = {
  placidus: "P",
  regiomontanus: "R",
  wholeSign: "W",
  campanus: "C",
  equal: "E",
  porphyry: "O",
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
  isTransit?: boolean;
}

export function getPlanetImage(
  planet: PlanetType,
  options: ImgOptions = {
    size: 15,
    isAntiscion: false,
    isRetrograde: false,
    isTransit: false
  }
): React.ReactNode {
  const folder = "planets";
  const { size, isAntiscion, isRetrograde, isTransit } = options;
  let path = folder;

  if(isAntiscion)
    path += "/antiscion";
  else if(isTransit)
    path += "/transits";

  path += `/${planet}${isRetrograde ? "-rx" : ""}.png`

  return (
    <Image
      alt="planet"
      src={path}
      width={size ?? 15}
      height={size ?? 15}
      unoptimized
    />
  );
}

export function getArabicPartImage(
  lotOrKey: ArabicPart | ArabicPartType,
  options: ImgOptions = { isAntiscion: false }
): React.ReactNode {
  const folder = "planets";
  const part =
    typeof lotOrKey === "string" ? lotOrKey : 
      lotOrKey.planet ? lotOrKey.partKey : "custom-lot";

  const path = `/${folder}${options.isAntiscion ? "/antiscion" : ""}/${part}.png`;

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
    <span className="shrink-0 flex items-center justify-center">
      <Image alt="aspect" src={path} width={size} height={size} unoptimized />
    </span>
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
  const minutes = Math.floor((decimalTime - hours) * 60.5);
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
  // console.log(`degNumber: ${degNumber}, minNumber: ${minNumber}`);

  if (degNumber < 0) degNumber = 0;
  else if (degNumber > degThreshold) degNumber = degThreshold;

  if (minNumber > 59) minNumber = 59;

  const result = degNumber + minNumber / 100;

  return result;
};

export function toDate(birthDate: BirthDate): Date {
  const [hours, minutes] = getHourAndMinute(parseFloat(birthDate.time)).split(':');

  return new Date(
    birthDate.year,
    birthDate.month - 1,
    birthDate.day,
    parseInt(hours),
    parseInt(minutes),
  );
}

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

export const getHousesProfection = (houses: number[], years: number) => {
  const offset = (years * 30) % 360;
  return houses.map(h => ((h + offset) % 360 + 360) % 360);
}

export const getPlanetsProfection = (planets: Planet[], years: number): Planet[] => {
  const offset = (years * 30) % 360;
  return planets.map(p => ({
    ...p,
    longitude: ((p.longitude + offset) % 360 + 360) % 360,
    longitudeRaw: ((p.longitudeRaw + offset) % 360 + 360) % 360
  }));
}

export const getProfectionChart = (birthChart: BirthChart, profectionYear: number) => {
  const profectedHousesData = getHousesProfection(birthChart.housesData.house, profectionYear);
  const profectedPlanetsData = getPlanetsProfection(birthChart.planets, profectionYear);

  const profectedChart: BirthChart = {
    ...birthChart,
    birthDate: {
      ...birthChart.birthDate,
      year: profectionYear ? birthChart.birthDate.year + profectionYear : birthChart.birthDate.year,
    },
    planets: profectedPlanetsData,
    housesData: {
      ...birthChart.housesData,
      ascendant: profectedHousesData[0],
      mc: profectedHousesData[9],
      house: profectedHousesData,
    },
  }

  return profectedChart;
}

export const convertTransitsToChart = (transits: Transits): BirthChart => ({
  planets: [...transits.planets],
  planetsWithSigns: transits.planetsWithSigns? [...transits.planetsWithSigns] : undefined,
  birthDate: {...transits.date},
  fixedStars: [],
  housesData: {
    armc: 0,
    ascendant: 0,
    equatorialAscendant: 0,
    house: [],
    housesWithSigns: [],
    kochCoAscendant: 0,
    mc: 0,
    munkaseyCoAscendant: 0,
    munkaseyPolarAscendant: 0,
    vertex: 0
  },
})

export const getHouseSystemLabel = (houseSystem: HouseSystem) => houseSystem.charAt(0).toUpperCase() + houseSystem.slice(1);

export function getTermRuler(
  sign: Sign,
  degree: number,
  terms: Record<Sign, TermOrDecan[]>
): PlanetType {
  return terms[sign].find(
    term => degree >= term.start && degree < term.end
  )!.ruler;
}

export function getDecanRuler(
  sign: Sign,
  degree: number
): PlanetType {
  return CHALDEAN_DECANS[sign].find(
    decan => degree >= decan.start && degree < decan.end
  )!.ruler;
}

export function getGenderIconPath(gender: GenderType) {
  if(gender === "male") {
    return "/male.png";
  } else if(gender === "female") {
    return "/female.png";
  } else 
    return "/event.png";
}

export function isDiurnal(sunLongitude: number, ascendant: number): boolean {
  // Converte a longitude do Sol para posição relativa ao ASC (0-360, sentido horário)
  const relativePos = (sunLongitude - ascendant + 360) % 360;

  // console.log(`sun: ${sunLongitude}, asc: ${ascendant}, relativePos: ${relativePos}`);

  // Casas 7 - 12 = hemisfério superior = diurno (relativePos entre 180 e 360)
  // Casas 1 - 6  = hemisfério inferior = noturno (relativePos entre 0 e 180)
  return relativePos >= 180;
}

export function applyDateStep(birthDate: BirthDate, direction: "previous" | "next", 
  stepData: { value: number; unit: AdvanceChartUnitType }): BirthDate {
  const jsDate = toDate(birthDate);
  const amount = (direction === "previous" ? -1 : 1) * stepData.value;
  
  switch (stepData.unit) {
    case "minutes":
      jsDate.setMinutes(jsDate.getMinutes() + amount);
      break;
    case "hours":
      jsDate.setHours(jsDate.getHours() + amount);
      break;
    case "days":
      jsDate.setDate(jsDate.getDate() + amount);
      break;
    case "weeks":
      jsDate.setDate(jsDate.getDate() + amount * 7);
      break;
    case "months":
      jsDate.setMonth(jsDate.getMonth() + amount);
      break;
    case "years":
      jsDate.setFullYear(jsDate.getFullYear() + amount);
      break;
  }

  const finalTimeString = convertDegMinToDecimal(jsDate.getHours(), jsDate.getMinutes()).toString();
  return {
    ...birthDate,
    day: jsDate.getDate(),
    month: jsDate.getMonth() + 1,
    year: jsDate.getFullYear(),
    time: finalTimeString
  } as BirthDate;
}