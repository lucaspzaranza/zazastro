import { z } from "zod";
import type { ForecastQueryParams } from "@/hooks/useForecastQuery";

export const ForecastQuerySchema = z.object({
  coordinatesLat: z.coerce.number().min(-90).max(90),
  coordinatesLng: z.coerce.number().min(-180).max(180),
  coordinatesPlace: z.string().optional(),
  period: z.enum(["month", "year"]),
  day: z.coerce.number().int().min(1).max(31).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int(),
  time: z.coerce.number().optional(),
  planet: z.coerce.number().int().optional(),
  include: z.string().optional(),      // CSV: "ingress,aspect,station"
  aspectTypes: z.string().optional(),  // CSV: "conjunction,square"
});

export type ForecastQuery = z.infer<typeof ForecastQuerySchema>;

export function buildForecastUrl(params: ForecastQueryParams): string {
  const search = new URLSearchParams();
  search.set("coordinatesLat", String(params.coordinates.latitude));
  search.set("coordinatesLng", String(params.coordinates.longitude));
  if (params.coordinates.name) search.set("coordinatesPlace", params.coordinates.name);
  search.set("period", params.period);
  if (params.startDate) {
    search.set("day", String(params.startDate.day));
    search.set("month", String(params.startDate.month));
    search.set("year", String(params.startDate.year));
    search.set("time", String(params.startDate.time));
  }
  if (params.planet !== undefined) search.set("planet", String(params.planet));
  if (params.include?.length) search.set("include", params.include.join(","));
  if (params.aspectTypes?.length) search.set("aspectTypes", params.aspectTypes.join(","));
  return `/forecast?${search.toString()}`;
}

export function forecastQueryToParams(query: ForecastQuery): ForecastQueryParams {
  return {
    coordinates: { latitude: query.coordinatesLat, longitude: query.coordinatesLng, name: query.coordinatesPlace },
    period: query.period,
    startDate: {
      day: query.day ?? 1,
      month: query.month ?? 1,
      year: query.year,
      time: query.time ?? 0,
    },
    planet: query.planet,
    include: query.include ? (query.include.split(",") as ("ingress" | "aspect" | "station")[]) : undefined,
    aspectTypes: query.aspectTypes ? query.aspectTypes.split(",") : undefined,
  };
}