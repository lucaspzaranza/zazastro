// src/interfaces/TransitsForecastInterfaces.ts
import { AspectType } from "./AstroChartInterfaces";

export interface IngressEvent {
  sign: string;
  date: string;
}

export interface AspectEvent {
  aspectType: AspectType;
  withPlanet: string;
  date: string;
  degree: number;
  sign: string;
  withPlanetDegree: number;
  withPlanetSign: string;
}

export interface StationEvent {
  type: "retrograde" | "direct";
  date: string;
  degree: number;
  sign: string;
}

export interface PlanetForecast {
  id: number;
  name: string;
  ingresses: IngressEvent[];
  aspects: AspectEvent[];
  stations: StationEvent[];
}

export interface TransitsForecastResponse {
  timezone: string;
  periodStart: string;
  periodEnd: string;
  planets: PlanetForecast[];
}

export type ForecastEventType = "ingress" | "aspect" | "station";

// Forma unificada pra listar ingresso/aspecto/estação juntos, ordenados por data
export interface ForecastEventRow {
  type: ForecastEventType;
  planetId: number;
  planetName: string;
  date: string;
  sign?: string;
  degree?: number;
  aspectType?: AspectType;
  withPlanet?: string;
  withPlanetSign?: string;
  withPlanetDegree?: number;
  stationType?: "retrograde" | "direct";
}