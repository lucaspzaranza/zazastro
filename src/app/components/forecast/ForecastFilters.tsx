// src/app/components/forecast/ForecastFilters.tsx
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { monthsNames, getAspectImage } from "@/app/utils/chartUtils";
import { planetTypes } from "@/interfaces/BirthChartInterfaces";
import type { ForecastQueryParams } from "@/hooks/useForecastQuery";
import type { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import ChipToggle from "./ChipToggle";
import Collapsible from "./Collapsible";
import CitySearch from "@/app/components/CitySearch";
import { AspectType } from "@/interfaces/AstroChartInterfaces";

interface ForecastFiltersProps {
  /** Painel dentro de um mapa: cidade já conhecida, esconde o input. */
  coordinates?: SelectedCity;
  /** Rota standalone, chegando via link com query params: pré-preenche, mas continua editável. */
  initialCity?: SelectedCity;
  initialPeriod?: "month" | "year";
  initialMonth?: number;
  initialYear?: number;
  initialPlanet?: number;
  onSubmit: (params: ForecastQueryParams) => void;
  loading?: boolean;
  inlineFilters?: boolean; // <- novo. false (padrão) = dropdown, true = campos soltos
}

const SELECTABLE_PLANETS = planetTypes.slice(0, 10).map((type, id) => ({ id, type }));
const INCLUDE_OPTIONS: { key: "ingress" | "aspect" | "station"; labelKey: string }[] = [
  { key: "ingress", labelKey: "forecast.eventTypes.ingress" },
  { key: "aspect", labelKey: "forecast.eventTypes.aspect" },
  { key: "station", labelKey: "forecast.eventTypes.station" },
];
const ASPECT_TYPE_OPTIONS: AspectType[] = ["conjunction", "sextile", "square", "trine", "opposition"];

export default function ForecastFilters({
  coordinates, initialCity, initialPeriod, initialMonth, initialYear, initialPlanet, onSubmit, loading, inlineFilters = false,
}: ForecastFiltersProps) {
  const t = useTranslations();
  const now = new Date();

  const [period, setPeriod] = useState<"month" | "year">(initialPeriod ?? "month");
  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1);
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [planet, setPlanet] = useState<number | "">(initialPlanet ?? "");
  const [city, setCity] = useState<SelectedCity | undefined>(coordinates ?? initialCity);
  const [include, setInclude] = useState<Set<"ingress" | "aspect" | "station">>(
    new Set(["ingress", "aspect", "station"])
  );
  const [aspectTypes, setAspectTypes] = useState<Set<AspectType>>(new Set(ASPECT_TYPE_OPTIONS));

  const needsCityInput = coordinates === undefined;
  const effectiveCoordinates = coordinates ?? city;

  const toggleInclude = (key: "ingress" | "aspect" | "station") =>
    setInclude((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleAspectType = (type: AspectType) =>
    setAspectTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveCoordinates) return; // trava: sem cidade escolhida, não envia

    const startDate = period === "month"
      ? { day: 1, month, year, time: 0 }
      : { day: 1, month: 1, year, time: 0 };

    onSubmit({
      coordinates: effectiveCoordinates,
      period,
      planet: planet === "" ? undefined : planet,
      startDate,
      include: include.size > 0 ? Array.from(include) : undefined,
      aspectTypes: include.has("aspect") && aspectTypes.size > 0 ? Array.from(aspectTypes) : undefined,
    });
  };

  return (
    <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex flex-row gap-2">
        <label className="flex-1 flex flex-col gap-1 text-sm text-zinc-600">
          {t("forecast.period")}
          <select className="default-input-field" value={period} onChange={(e) => setPeriod(e.target.value as "month" | "year")}>
            <option value="month">{t("forecast.month")}</option>
            <option value="year">{t("forecast.year")}</option>
          </select>
        </label>

        <label className="flex-1 flex flex-col gap-1 text-sm text-zinc-600">
          {t("forecast.planet")}
          <select className="default-input-field" value={planet} onChange={(e) => setPlanet(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">{t("forecast.allPlanets")}</option>
            {SELECTABLE_PLANETS.map(({ id, type }) => (
              <option key={id} value={id}>{t(`planets.${type}`)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-row gap-2">
        {period === "month" && (
          <select required className="default-input-field flex-1" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {monthsNames.map((_, index) => (
              <option key={index} value={index + 1}>{t(`months.${index + 1}`)}</option>
            ))}
          </select>
        )}
        <input
          required
          type="number"
          className={`default-input-field ${period === "month" ? "w-24" : "flex-1"}`}
          placeholder={t("form.year")}
          value={year}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value);
            if (!Number.isNaN(parsed)) setYear(Math.max(0, Math.min(2999, parsed)));
          }}
        />
      </div>

      {needsCityInput && (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-zinc-600">{t("forecast.city")}*</span>
          <CitySearch onSelect={setCity} />
        </div>
      )}

      {inlineFilters ? (
        <div className="w-full flex flex-col gap-2 border-t border-zinc-200 pt-3">
          <span className="text-sm font-medium text-zinc-700">{t("forecast.filters")}</span>
          <span className="text-xs text-zinc-500">{t("forecast.whatToShow")}</span>
          <div className="flex flex-row flex-wrap gap-2">
            {INCLUDE_OPTIONS.map(({ key, labelKey }) => (
              <ChipToggle key={key} active={include.has(key)} onClick={() => toggleInclude(key)}>
                {t(labelKey)}
              </ChipToggle>
            ))}
          </div>

          {include.has("aspect") && (
            <>
              <span className="text-xs text-zinc-500 mt-1">{t("forecast.whichAspects")}</span>
              <div className="flex flex-row flex-wrap gap-2">
                {ASPECT_TYPE_OPTIONS.map((type) => (
                  <ChipToggle key={type} active={aspectTypes.has(type)} onClick={() => toggleAspectType(type)} title={t(`forecast.aspectTypes.${type}`)}>
                    {getAspectImage(type, 14)}
                  </ChipToggle>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <Collapsible title={t("forecast.filters")} floating>
          <span className="text-xs text-zinc-500">{t("forecast.whatToShow")}</span>
          <div className="flex flex-row justify-center gap-2 flex-wrap">
            {INCLUDE_OPTIONS.map(({ key, labelKey }) => (
              <ChipToggle key={key} active={include.has(key)} onClick={() => toggleInclude(key)}>
                {t(labelKey)}
              </ChipToggle>
            ))}
          </div>

          {include.has("aspect") && (
            <>
              <span className="text-xs text-zinc-500 mt-1">{t("forecast.whichAspects")}</span>
              <div className="flex flex-row justify-center gap-2 flex-wrap">
                {ASPECT_TYPE_OPTIONS.map((type) => (
                  <ChipToggle key={type} active={aspectTypes.has(type)} onClick={() => toggleAspectType(type)} title={t(`forecast.aspectTypes.${type}`)}>
                    {getAspectImage(type, 14)}
                  </ChipToggle>
                ))}
              </div>
            </>
          )}
        </Collapsible>
      )}

      <button type="submit" disabled={loading || !effectiveCoordinates} className="default-btn">
        {t("forecast.generate")}
      </button>
    </form>
  );
}