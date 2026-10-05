import { planesNamesByType, signsGlpyphs, decimalToDegreesMinutes } from "@/app/utils/chartUtils";
import type { PlanetType } from "@/interfaces/BirthChartInterfaces";

const PLANET_TYPE_BY_NAME: Record<string, PlanetType> = Object.fromEntries(
  Object.entries(planesNamesByType).map(([type, name]) => [name, type])
) as Record<string, PlanetType>;

const SIGN_NAMES_PT = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes",
];

// Chave em inglês pra bater com o namespace de tradução `signs.*`
const SIGN_KEYS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

export function planetTypeFromName(name: string): PlanetType | undefined {
  return PLANET_TYPE_BY_NAME[name];
}

function signIndexFromName(name: string): number {
  const index = SIGN_NAMES_PT.indexOf(name);
  return index >= 0 ? index : 0;
}

export function signKeyFromName(name: string): string {
  return SIGN_KEYS[signIndexFromName(name)];
}

// "14°28'♏︎" — grau + glifo colorível, pros itens de aspecto
export function formatDegreeSignGlyph(degree: number, signName: string): string {
  const glyph = signsGlpyphs[signIndexFromName(signName)];
  const packed = decimalToDegreesMinutes(degree);
  const degrees = Math.floor(packed);
  let minutes = Math.floor((packed - degrees) * 100).toString();
  if (minutes.length === 1) minutes = "0" + minutes;
  return `${degrees}°${minutes}'${glyph}`;
}

// "Virgem ♍︎" — nome traduzido + glifo colorível, sem grau (ingresso/estação)
export function formatSignNameGlyph(signName: string, translatedName: string): string {
  const glyph = signsGlpyphs[signIndexFromName(signName)];
  return `${translatedName} ${glyph}`;
}

// Glifo puro, sem cor — usado no cabeçalho colapsado do ingresso
export function plainSignGlyph(signName: string): string {
  return signsGlpyphs[signIndexFromName(signName)];
}

// "14°28'" — sem glifo de signo, só grau e minuto, pro item de estação
export function formatDegreeMinute(degree: number): string {
  const packed = decimalToDegreesMinutes(degree);
  const degrees = Math.floor(packed);
  let minutes = Math.floor((packed - degrees) * 100).toString();
  if (minutes.length === 1) minutes = "0" + minutes;
  return `${degrees}°${minutes}'`;
}

export function formatForecastDate(dateStr: string): string {
  const [datePart, timePart] = dateStr.split(" ");
  const [year, month, day] = datePart.split("-");
  const [hour, minute] = (timePart ?? "00:00:00").split(":");
  return `${day}/${month}/${year} ${hour}:${minute}`;
}