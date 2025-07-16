import {
  PlanetOverlap,
  PlanetType,
  planetTypes,
} from "@/interfaces/BirthChartInterfaces";

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

export function getPlanetSymbol(planet: PlanetType): string {
  const planetsSymbols: Record<PlanetType, string> = {
    sun: "☉",
    moon: "☾",
    mercury: "☿",
    venus: "♀",
    mars: "♂",
    jupiter: "♃",
    saturn: "♄",
    uranus: "♅",
    neptune: "♆",
    pluto: "♇",
    northNode: "Ω",
    southNode: "ω",
  };

  return planetsSymbols[planet];
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
  const degrees = Math.floor(decimal);
  const minutes = Math.floor((decimal - degrees) * 61) / 100;

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

export const planetOverlapData: Record<PlanetType, PlanetOverlap> = {
  moon: {
    baseSymbolOffset: 15,
    overlapGap: 15,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  mercury: {
    baseSymbolOffset: 15,
    overlapGap: 12.5,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  venus: {
    baseSymbolOffset: 15,
    overlapGap: 15,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  sun: {
    baseSymbolOffset: 15,
    overlapGap: 12.5,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  mars: {
    baseSymbolOffset: 15,
    overlapGap: 10,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  jupiter: {
    baseSymbolOffset: 15,
    overlapGap: 10,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  saturn: {
    baseSymbolOffset: 15,
    overlapGap: 10,
    thresholdDeg: 5,
    planetOrder: 0,
  },
  uranus: {
    baseSymbolOffset: 15,
    overlapGap: 18,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  neptune: {
    baseSymbolOffset: 15,
    overlapGap: 16.5,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  pluto: {
    baseSymbolOffset: 15,
    overlapGap: 15,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  northNode: {
    baseSymbolOffset: 15,
    overlapGap: 15,
    thresholdDeg: 4,
    planetOrder: 0,
  },
  southNode: {
    baseSymbolOffset: 15,
    overlapGap: 15,
    thresholdDeg: 4,
    planetOrder: 0,
  },
};
