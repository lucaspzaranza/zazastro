import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { PlanetAspectData } from "@/interfaces/AstroChartInterfaces";
import {
  BirthChartProfile,
  BirthDate,
  Coordinates,
  PlanetOverlap,
  PlanetType,
  planetTypes,
} from "@/interfaces/BirthChartInterfaces";

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

export function getPlanetImage(planet: PlanetType, size = 15): React.ReactNode {
  const folder = "planets";
  const path = `${folder}/${planet}.png`;
  return <img src={path} width={size} />;
}

export function getArabicPartImage(
  lot: ArabicPart,
  size = 15
): React.ReactNode {
  const folder = "planets";
  const part = lot.planet ? lot.partKey : "fortune";
  const path = `${folder}/${part}.png`;
  return <img src={path} width={size} />;
}

export function getAspectImage(
  aspect: PlanetAspectData,
  size = 15
): React.ReactNode {
  const folder = "aspects";
  const aspectType = aspect.aspectType;
  const path = `${folder}/${aspectType}.png`;

  return <img src={path} width={size} />;
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
  let long = wrapZodiacLongitude(longitude);

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

export function getHourAndMinute(decimalTime: number): string {
  const hours = Math.floor(decimalTime);
  const minutes = Math.floor((decimalTime - hours) * 60);
  const hoursString = hours.toString().padStart(2, "0");
  return `${hoursString}:${minutes}`;
}

export function convertDegMinToDecimal(deg: number, min: number) {
  // const [deg, min] = time.split(":").map(Number);
  const decimal = deg + min / 60;
  return parseFloat(decimal.toFixed(4));
}

export function convertDegMinNumberToDecimal(degMin: number) {
  // console.log(degMin);
  const degrees = Math.floor(degMin);
  const minutes = Number.parseFloat(((degMin - degrees) * 100).toFixed(2));

  const result = degrees + minutes / 60;
  // console.log(
  //   `degMin: ${degMin}, degrees: ${degrees}, minutes: ${minutes}, result: ${result}`
  // );
  return result;
}

const coordinates: Coordinates = {
  latitude: -3.71839, // Fortaleza
  longitude: -38.5434,
};

const quixabaCoordinates: Coordinates = {
  latitude: -4.5461,
  longitude: -37.6923,
};

const aracatiCoordinates: Coordinates = {
  latitude: -4.56273,
  longitude: -37.7691,
};

const SPCoordinates: Coordinates = {
  latitude: -23.5489,
  longitude: -46.6388,
};

const MontesClarosCoordinates: Coordinates = {
  latitude: -16.737,
  longitude: -43.8647,
};

const icoordinates: Coordinates = {
  latitude: -6.4011,
  longitude: -38.8622,
};

const barbacenaCoordinates: Coordinates = {
  latitude: -21.2264,
  longitude: -43.7742,
};

export const presavedBirthDates: Record<string, BirthChartProfile> = {
  lucasz: {
    name: "Lucas Zaranza",
    birthDate: {
      year: 1993,
      month: 8,
      day: 31,
      time: convertDegMinToDecimal(6, 45).toString(),
      coordinates,
    },
  },
  elisa: {
    name: "Elisa Ferraz",
    birthDate: {
      year: 1994,
      month: 6,
      day: 23,
      time: convertDegMinToDecimal(20, 19).toString(),
      coordinates: SPCoordinates,
    },
  },
  alana: {
    name: "Alana Angelim",
    birthDate: {
      year: 1997,
      month: 5,
      day: 1,
      time: convertDegMinToDecimal(13, 47).toString(),
      coordinates: icoordinates,
    },
  },
  noivado: {
    name: "Noivado",
    birthDate: {
      year: 2025,
      month: 4,
      day: 26,
      time: convertDegMinToDecimal(17, 5).toString(),
      coordinates: aracatiCoordinates,
    },
  },
  jana: {
    name: "Janaina Libarino",
    birthDate: {
      year: 1995,
      month: 6,
      day: 20,
      time: convertDegMinToDecimal(2, 20).toString(),
      coordinates: SPCoordinates,
    },
  },
  aline: {
    name: "Aline Zaranza",
    birthDate: {
      year: 1999,
      month: 3,
      day: 22,
      time: convertDegMinToDecimal(12, 39).toString(),
      coordinates,
    },
  },
  anaFlavia: {
    name: "Ana Flávia",
    birthDate: {
      year: 1994,
      month: 12,
      day: 2,
      time: convertDegMinToDecimal(5, 15).toString(),
      coordinates: MontesClarosCoordinates,
    },
  },
  layCurcio: {
    name: "Laiza Curcio",
    birthDate: {
      year: 1995,
      month: 5,
      day: 11,
      time: convertDegMinToDecimal(8, 45).toString(),
      coordinates: barbacenaCoordinates,
    },
  },
  eduardoLay: {
    name: "Eduardo da Lay",
    birthDate: {
      year: 1995,
      month: 5,
      day: 24,
      time: convertDegMinToDecimal(10, 45).toString(),
      coordinates: barbacenaCoordinates,
    },
  },
  lala: {
    name: "Laís Pontes",
    birthDate: {
      year: 2002,
      month: 5,
      day: 4,
      time: convertDegMinToDecimal(2, 24).toString(),
      coordinates: coordinates,
    },
  },
};
