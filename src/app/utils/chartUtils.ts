import { PlanetType } from "@/interfaces/BirthChart";

export function getSign(longitude: number) {
  const signs = [
    "Áries ♈",
    "Touro ♉",
    "Gêmeos ♊",
    "Câncer ♋",
    "Leão ♌",
    "Virgem ♍",
    "Libra ♎",
    "Escorpião ♏",
    "Sagitário ♐",
    "Capricórnio ♑",
    "Aquário ♒",
    "Peixes ♓",
  ];
  return signs[Math.floor(longitude / 30) % 12];
}

/**
 * Returns the formatted longitude value with its corresponding Sign.
 * @param longitude The longitude value to be formatted.
 * @returns The position at the Zodiac to that longitude.
 */
export function getDegreeAndSign(longitude: number) {
  const sign = getSign(longitude);
  const previousSign = Math.floor(longitude / 30);
  const rest = Number.parseFloat((longitude - previousSign * 30).toFixed(2));
  const degrees = Math.floor(rest);
  let minutes = Math.floor((rest - degrees) * 100).toString();

  if (minutes.length === 1) {
    minutes = "0" + minutes;
  }

  const result = `${degrees}°${minutes}' de ${sign}`;

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

  return getRaw ? result : decimalToDegreesMinutes(result);
}

export function clampZodiacLongitude(longitude: number) {
  if (longitude < 0) {
    return (longitude += 360);
  } else if (longitude >= 360) {
    return (longitude -= 360);
  }

  return longitude;
}

export function getZodiacRuler(longitude: number) {
  let long = clampZodiacLongitude(longitude);

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
