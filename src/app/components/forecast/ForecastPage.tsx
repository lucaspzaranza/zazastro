// src/app/components/forecast/ForecastPage.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import moment from "moment-timezone";
import Link from "next/link";
import Image from "next/image";
import { FaHome } from "react-icons/fa";
import Container from "@/app/components/Container";
import ForecastFilters from "./ForecastFilters";
import ForecastResults from "./ForecastResults";
import { useForecastQuery, ForecastQueryParams } from "@/hooks/useForecastQuery";
import { buildForecastUrl, forecastQueryToParams, type ForecastQuery } from "@/utils/forecastUrl";
import Spinner from "../Spinner";

interface ForecastPageProps {
  initialQuery?: ForecastQuery;
}

export default function ForecastPage({ initialQuery }: ForecastPageProps) {
  const router = useRouter();
  const t = useTranslations();
  const { data, loading, error, fetchForecast } = useForecastQuery();
  const initialParams = initialQuery ? forecastQueryToParams(initialQuery) : undefined;
  const [lastParams, setLastParams] = useState<ForecastQueryParams | undefined>(initialParams);
  const [mobileView, setMobileView] = useState<"filters" | "results">(initialParams ? "results" : "filters");
  const didAutoFetch = useRef(false);

  useEffect(() => {
    if (initialParams && !didAutoFetch.current) {
      didAutoFetch.current = true;
      fetchForecast(initialParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (params: ForecastQueryParams) => {
    setLastParams(params);
    fetchForecast(params);
    router.replace(buildForecastUrl(params));
    setMobileView("results");
  };

  const shiftPeriod = (direction: 1 | -1) => {
    if (!lastParams || !data) return;
    const anchor = moment(data.periodStart, "YYYY-MM-DD HH:mm:ss")
      .add(direction, lastParams.period === "year" ? "year" : "month");
    const nextParams: ForecastQueryParams = {
      ...lastParams,
      startDate: { day: 1, month: anchor.month() + 1, year: anchor.year(), time: 0 },
    };
    setLastParams(nextParams);
    fetchForecast(nextParams);
    router.replace(buildForecastUrl(nextParams));
  };

  const resultsContent = loading ? (
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
    <div className="w-full h-[520px] flex items-center justify-center border border-dashed border-zinc-300 rounded-lg text-sm text-zinc-400">
      {t("forecast.placeholder")}
    </div>
  ) : lastParams && (
    <ForecastResults
      data={data}
      period={lastParams.period}
      itemsPerPage={14}
      onPreviousPeriod={() => shiftPeriod(-1)}
      onNextPeriod={() => shiftPeriod(1)}
    />
  );

  const filtersBlock = (
    <ForecastFilters
      initialCity={initialParams?.coordinates}
      initialPeriod={initialParams?.period}
      initialMonth={initialParams?.startDate?.month}
      initialYear={initialParams?.startDate?.year}
      initialPlanet={initialParams?.planet}
      onSubmit={handleSubmit}
      loading={loading}
      inlineFilters
    />
  );

  return (
    <div className="relative w-[95%] md:w-[720px] my-8">
      <Container className="w-full h-[660px] sm:h-[640px]">
        <div className="w-full h-full flex flex-col md:flex-row gap-4 p-4 sm:p-0">
          {/* Desktop: as duas colunas sempre visíveis */}
          <div className="hidden md:flex md:w-[260px] flex-shrink-0 md:h-full md:overflow-y-auto md:pr-1 flex-col gap-3">
            {filtersBlock}
            <Link href="/" className="default-btn">
              {t("form.back")}
              <Image src="/back.png" width={22} height={22} unoptimized alt="chart" />
            </Link>
          </div>
          <div className="hidden md:block flex-1 min-w-0 h-full">
            {resultsContent}
          </div>

          {/* Mobile: alterna entre formulário e resultado */}
          <div className="md:hidden w-full h-full flex flex-col gap-3">
            {mobileView === "filters" ? (
              <>
                {filtersBlock}
                <Link href="/" className="default-btn self-center w-full">
                  {t("form.back")}
                  <Image src="/back.png" width={22} height={22} unoptimized alt="chart" />
                </Link>
              </>
            ) : (
              <>
                <div className="w-full flex flex-row items-center justify-center text-sm gap-2">
                  <Link href="/" className="default-btn">
                    <FaHome size={20} />
                    {t("forecast.backHome")}
                  </Link>
                  <button onClick={() => setMobileView("filters")} className="default-btn">
                    {t("forecast.editSearch")}
                  </button>
                </div>
                <div className="w-full flex-1 min-h-0">
                  {resultsContent}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}