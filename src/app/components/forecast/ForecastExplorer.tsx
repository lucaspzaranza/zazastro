// src/app/components/forecast/ForecastExplorer.tsx
"use client";
import { useState } from "react";
import moment from "moment-timezone";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Spinner from "@/app/components/Spinner";
import ForecastFilters from "./ForecastFilters";
import ForecastResults from "./ForecastResults";
import { useForecastQuery, ForecastQueryParams } from "@/hooks/useForecastQuery";
import type { SelectedCity } from "@/interfaces/BirthChartInterfaces";

interface ForecastExplorerProps {
  coordinates: SelectedCity;
}

export default function ForecastExplorer({ coordinates }: ForecastExplorerProps) {
  const t = useTranslations();
  const { data, loading, error, fetchForecast } = useForecastQuery();
  const [lastParams, setLastParams] = useState<ForecastQueryParams>();

  const handleSubmit = (params: ForecastQueryParams) => {
    setLastParams(params);
    fetchForecast(params);
  };

  const shiftPeriod = (direction: 1 | -1) => {
    if (!lastParams || !data) return;
    const anchor = moment(data.periodStart, "YYYY-MM-DD HH:mm:ss")
      .add(direction, lastParams.period === "year" ? "year" : "month");
    const nextParams: ForecastQueryParams = {
      ...lastParams,
      startDate: { day: anchor.date(), month: anchor.month() + 1, year: anchor.year(), time: 0 },
    };
    setLastParams(nextParams);
    fetchForecast(nextParams);
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-center gap-2">
      <ForecastFilters coordinates={coordinates} onSubmit={handleSubmit} loading={loading} />

      <div className="w-full flex-1 min-h-0">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3 border border-dashed border-zinc-300 rounded-lg">
            <Spinner size="12" />
            <span className="text-sm text-zinc-500">{t("home.loading")}</span>
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 border border-dashed border-red-300 rounded-lg text-sm text-red-600 text-center px-4">
            <span className="font-semibold flex flex-row items-center">
              {t("forecast.errorTitle")}
              <Image src="/warning.png" width={22} height={22} unoptimized alt="error" />
            </span>
            <span>{t("forecast.errorSubtitle")}</span>
          </div>
        ) : !data ? (
          <div className="w-full h-full flex items-center justify-center border border-dashed border-zinc-300 rounded-lg text-sm text-zinc-400">
            {t("forecast.placeholder")}
          </div>
        ) : lastParams && (
          <ForecastResults
            data={data}
            period={lastParams.period}
            onPreviousPeriod={() => shiftPeriod(-1)}
            onNextPeriod={() => shiftPeriod(1)}
          />
        )}
      </div>
    </div>
  );
}