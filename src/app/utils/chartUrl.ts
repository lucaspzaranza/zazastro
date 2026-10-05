import { z } from "zod";
import type { BirthDate, SelectedCity } from "@/interfaces/BirthChartInterfaces";

export const HouseSystemSchema = z.enum([
  "placidus", "regiomontanus", "campanus", "wholeSign", "equal", "porphyry",
]);

export const GenderSchema = z.enum(["male", "female", "event"]);

const CHART_PATHS: Record<ChartQuery["type"], string> = {
  birth: "/chart",
  moment: "/moment",
  transits: "/transits",
  solarReturn: "/solar-return",
  lunarReturn: "/lunar-return",
  lunarDerivedReturn: "/solar-return/lunar-derived-return",
  sinastry: "/sinastry",
  progression: "/progressions",
  profection: "/profections",
};

function birthDateFields(prefix: string) {
  return {
    [`${prefix}Day`]: z.coerce.number().int().min(1).max(31),
    [`${prefix}Month`]: z.coerce.number().int().min(1).max(12),
    [`${prefix}Year`]: z.coerce.number().int(),
    [`${prefix}Time`]: z.string().min(1), // mantém o formato decimal existente
    [`${prefix}Lat`]: z.coerce.number().min(-90).max(90),
    [`${prefix}Lng`]: z.coerce.number().min(-180).max(180),
    [`${prefix}Place`]: z.string().optional(), // SelectedCity.name
  } as const;
}

export function birthDateToQueryFields(prefix: string, birthDate: BirthDate) {
  return {
    [`${prefix}Day`]: birthDate.day,
    [`${prefix}Month`]: birthDate.month,
    [`${prefix}Year`]: birthDate.year,
    [`${prefix}Time`]: birthDate.time,
    [`${prefix}Lat`]: birthDate.coordinates.latitude,
    [`${prefix}Lng`]: birthDate.coordinates.longitude,
    [`${prefix}Place`]: birthDate.coordinates.name,
  };
}

export const BirthChartQuerySchema = z.object({
  type: z.literal("birth"),
  profileName: z.string().min(1),
  gender: GenderSchema,
  houseSystem: HouseSystemSchema,
  profileId: z.string().optional(),
  ...birthDateFields("birth"),
});

export const MomentChartQuerySchema = z.object({
  type: z.literal("moment"),
  houseSystem: HouseSystemSchema,
  ...birthDateFields("birth"),
});

export const TransitsChartQuerySchema = z.object({
  type: z.literal("transits"),
  profileName: z.string().min(1),
  gender: GenderSchema,
  houseSystem: HouseSystemSchema,
  ...birthDateFields("birth"),
  ...birthDateFields("transits"),
});

export const SolarReturnQuerySchema = z.object({
  type: z.literal("solarReturn"),
  profileName: z.string().min(1),
  gender: GenderSchema,
  ...birthDateFields("birth"),
  targetYear: z.coerce.number().int(),
});

export const LunarReturnQuerySchema = z.object({
  type: z.literal("lunarReturn"),
  profileName: z.string().min(1),
  gender: GenderSchema,
  ...birthDateFields("birth"),
  targetDay: z.coerce.number().int().min(1).max(31),
  targetMonth: z.coerce.number().int().min(1).max(12),
  targetYear: z.coerce.number().int(),
});

export const SinastryQuerySchema = z.object({
  type: z.literal("sinastry"),
  profile1Name: z.string().min(1),
  gender1: GenderSchema,
  ...birthDateFields("p1"),
  profile2Name: z.string().min(1),
  gender2: GenderSchema,
  ...birthDateFields("p2"),
});

export const ProgressionQuerySchema = z.object({
  type: z.literal("progression"),
  profileName: z.string().min(1),
  gender: GenderSchema,
  ...birthDateFields("birth"),
  years: z.coerce.number().int().min(0),
});

export const ProfectionQuerySchema = z.object({
  type: z.literal("profection"),
  profileName: z.string().min(1),
  gender: GenderSchema,
  ...birthDateFields("birth"),
  years: z.coerce.number().int().min(0),
});

export const LunarDerivedReturnQuerySchema = z.object({
  type: z.literal("lunarDerivedReturn"),
  profileName: z.string().min(1),
  gender: GenderSchema,
  ...birthDateFields("birth"),          // nascimento original
  solarTargetYear: z.coerce.number().int(), // ano usado pra achar a Rev. Solar da qual deriva
  derivedDay: z.coerce.number().int().min(1).max(31),
  derivedMonth: z.coerce.number().int().min(1).max(12),
  derivedYear: z.coerce.number().int(),
});

export const ChartQuerySchema = z.discriminatedUnion("type", [
  BirthChartQuerySchema,
  MomentChartQuerySchema,
  TransitsChartQuerySchema,
  SolarReturnQuerySchema,
  LunarReturnQuerySchema,
  LunarDerivedReturnQuerySchema,
  SinastryQuerySchema,
  ProgressionQuerySchema,
  ProfectionQuerySchema,
]);

export type ChartQuery = z.infer<typeof ChartQuerySchema>;

type ChartUrlInput = { type: ChartQuery["type"] } & Record<string, string | number | undefined>;

export function buildChartUrl(query: ChartUrlInput): string {
  if (process.env.NODE_ENV === "development") {
    const check = ChartQuerySchema.safeParse(query);
    if (!check.success) console.warn("buildChartUrl: incomplete or invalid query", check.error.issues);
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (key === "type" || value === undefined) return;
    params.set(key, String(value));
  });
  return `${CHART_PATHS[query.type]}?${params.toString()}`;
}

// Reconstrói o BirthDate (com SelectedCity completo) no formato que o backend já espera
export function extractBirthDate(
  query: Record<string, unknown>,
  prefix: string,
  houseSystem?: string
): BirthDate {
  const coordinates: SelectedCity = {
    latitude: Number(query[`${prefix}Lat`]),
    longitude: Number(query[`${prefix}Lng`]),
    name: query[`${prefix}Place`] ? String(query[`${prefix}Place`]) : undefined,
  };

  return {
    day: Number(query[`${prefix}Day`]),
    month: Number(query[`${prefix}Month`]),
    year: Number(query[`${prefix}Year`]),
    time: String(query[`${prefix}Time`]),
    coordinates,
    ...(houseSystem ? { houseSystem } : {}),
  };
}

export type ChartData = z.infer<typeof ChartQuerySchema>;

export function parseChartUrl(searchParams: Record<string, string | string[] | undefined>) {
  return ChartQuerySchema.safeParse(searchParams);
}