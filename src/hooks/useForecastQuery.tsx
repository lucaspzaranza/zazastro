// src/hooks/useForecastQuery.ts
"use client";
import { useState, useCallback } from "react";
import { apiFetch } from "@/app/utils/api";
import type { TransitsForecastResponse } from "@/interfaces/TransitsForecastInterfaces";
import type { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import { useTranslations } from "next-intl";

export interface ForecastQueryParams {
  coordinates: SelectedCity;
  period: "month" | "year";
  planet?: number;
  startDate?: { day: number; month: number; year: number; time: number };
  include?: ("ingress" | "aspect" | "station")[];
  aspectTypes?: string[];
  aspectWithPlanet?: number;
}

export function useForecastQuery() {
  const [data, setData] = useState<TransitsForecastResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false); // <- era string, agora é boolean

  const fetchForecast = useCallback(async (params: ForecastQueryParams) => {
    setLoading(true);
    setError(false);
    try {
      const result = await apiFetch("transits-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      setData(result);
    } catch {
      setData(undefined);
      setError(true); // <- não traduz aqui, só sinaliza que houve erro
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchForecast };
}