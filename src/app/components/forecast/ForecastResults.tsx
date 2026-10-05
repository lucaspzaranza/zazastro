// src/app/components/forecast/ForecastResults.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { getPlanetImage, getAspectImage, getSignColor, formatSignColor } from "@/app/utils/chartUtils";
import { planetTypeFromName, formatDegreeSignGlyph, plainSignGlyph, formatForecastDate } from "@/app/utils/forecastFormat";
import type { TransitsForecastResponse, ForecastEventRow } from "@/interfaces/TransitsForecastInterfaces";
import ChipToggle from "./ChipToggle";
import FilterDropdown from "./FilterDropdown";
import { monthsNames } from "@/app/utils/chartUtils";

const ITEMS_PER_PAGE = 10;
const LIST_HEIGHT = "h-full";

const VISIBLE_TYPE_OPTIONS = ["ingress", "aspect", "station"] as const;
const VISIBLE_ASPECT_OPTIONS = ["conjunction", "sextile", "square", "trine", "opposition"] as const;

interface ForecastResultsProps {
  data: TransitsForecastResponse;
  period: "month" | "year";
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  previousPeriodDisabled?: boolean;
  itemsPerPage?: number;
  isMobilePanel?: boolean;
}

function flattenEvents(data: TransitsForecastResponse): ForecastEventRow[] {
  const rows: ForecastEventRow[] = [];
  const seenAspectPairs = new Set<string>();

  data.planets.forEach((planet) => {
    planet.ingresses.forEach((ev) => rows.push({
      type: "ingress", planetId: planet.id, planetName: planet.name,
      date: ev.date, sign: ev.sign,
    }));
    planet.stations.forEach((ev) => rows.push({
      type: "station", planetId: planet.id, planetName: planet.name,
      date: ev.date, sign: ev.sign, degree: ev.degree, stationType: ev.type,
    }));
    planet.aspects.forEach((ev) => {
      const pairKey = [planet.name, ev.withPlanet].sort().join("|") + "|" + ev.aspectType + "|" + ev.date;
      if (seenAspectPairs.has(pairKey)) return;
      seenAspectPairs.add(pairKey);

      rows.push({
        type: "aspect", planetId: planet.id, planetName: planet.name,
        date: ev.date, sign: ev.sign, degree: ev.degree,
        aspectType: ev.aspectType, withPlanet: ev.withPlanet,
        withPlanetSign: ev.withPlanetSign, withPlanetDegree: ev.withPlanetDegree,
      });
    });
  });

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

function parseDayMonth(dateStr: string): { day: number; month: number } {
  const [datePart] = dateStr.split(" ");
  const [, month, day] = datePart.split("-");
  return { day: Number(day), month: Number(month) };
}

function ForwardIcon() {
  return <Image src="/fast-forward-black.png" width={13} height={13} alt="" unoptimized />;
}

function ColoredSignGlyph({ sign }: { sign: string }) {
  const glyph = plainSignGlyph(sign);
  return <span style={{ color: getSignColor(glyph) }}>{glyph}</span>;
}

function EventCell({ row }: { row: ForecastEventRow }) {
  const planetType = planetTypeFromName(row.planetName);
  const withPlanetType = row.withPlanet ? planetTypeFromName(row.withPlanet) : undefined;

  if (row.type === "aspect" && row.aspectType && row.sign && row.withPlanetSign) {
    return (
      <div className="flex flex-row items-center gap-1 tracking-tighter">
        {planetType && getPlanetImage(planetType, { size: 15 })}
        <span className="w-14 flex flex-row items-center justify-between">
          {formatSignColor(formatDegreeSignGlyph(row.degree ?? 0, row.sign))}
        </span>
        <span className="mx-1 flex flex-row items-center">
          {getAspectImage(row.aspectType, 15)}
        </span>
        {withPlanetType && getPlanetImage(withPlanetType, { size: 15 })}
        <span className="w-14 flex flex-row items-center justify-between">
          {formatSignColor(formatDegreeSignGlyph(row.withPlanetDegree ?? 0, row.withPlanetSign))}
        </span>
      </div>
    );
  }

  if (row.type === "station" && row.sign) {
    const becomingRetrograde = row.stationType === "retrograde";
    return (
      <div className="flex flex-row items-center gap-2">
        {planetType && getPlanetImage(planetType, { size: 15, isRetrograde: !becomingRetrograde })}
        <ForwardIcon />
        {planetType && getPlanetImage(planetType, { size: 15, isRetrograde: becomingRetrograde })}
        <span className="w-16 flex flex-row items-center justify-between">
          {formatSignColor(formatDegreeSignGlyph(row.degree ?? 0, row.sign))}
        </span>
      </div>
    );
  }

  // ingress
  return (
    <div className="grid grid-cols-[18px_14px_20px] items-center gap-1">
      {planetType && getPlanetImage(planetType, { size: 15 })}
      <ForwardIcon />
      {row.sign && <ColoredSignGlyph sign={row.sign} />}
    </div>
  );
}

export default function ForecastResults({
  data, period, onPreviousPeriod, onNextPeriod, previousPeriodDisabled,
  isMobilePanel,
  itemsPerPage = 10,
}: ForecastResultsProps) {

  console.log('isMobilePanel? ', isMobilePanel? "yes" : "no");
  
  const t = useTranslations();
  const [page, setPage] = useState(0);
  const [visibleTypes, setVisibleTypes] = useState<Set<"ingress" | "aspect" | "station">>(
    new Set(["ingress", "aspect", "station"])
  );
  const [visibleAspectTypes, setVisibleAspectTypes] = useState<Set<string>>(
    new Set(["conjunction", "sextile", "square", "trine", "opposition"])
  );
  const [dayFilter, setDayFilter] = useState<number | "">("");
  const [monthFilter, setMonthFilter] = useState<number | "">("");

  const toggleVisibleType = (key: "ingress" | "aspect" | "station") =>
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleVisibleAspectType = (type: string) =>
    setVisibleAspectTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });

  const rows = useMemo(() => {
    return flattenEvents(data).filter((row) => {
      if (!visibleTypes.has(row.type)) return false;
      if (row.type === "aspect" && row.aspectType && !visibleAspectTypes.has(row.aspectType)) return false;

      if (dayFilter !== "" || monthFilter !== "") {
        const { day, month } = parseDayMonth(row.date);
        if (dayFilter !== "" && day !== dayFilter) return false;
        if (monthFilter !== "" && month !== monthFilter) return false;
      }

      return true;
    });
  }, [data, visibleTypes, visibleAspectTypes, dayFilter, monthFilter]);

  useEffect(() => {
    setPage(0);
  }, [data, visibleTypes, visibleAspectTypes, dayFilter, monthFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const currentRows = rows.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const [startYear, startMonth] = data.periodStart.split("-");
  const periodLabel = period === "year"
    ? startYear
    : `${t(`months.${Number(startMonth)}`)} ${startYear}`;

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="w-full flex items-center justify-center gap-3 flex-shrink-0">
        <button onClick={onPreviousPeriod} disabled={previousPeriodDisabled} className="px-2 py-1 rounded-md hover:bg-zinc-200 disabled:opacity-30">◀</button>
        <span className="font-semibold text-sm text-zinc-800">{periodLabel}</span>

        <FilterDropdown label={t("forecast.filter")}>
          <span className="text-xs text-zinc-500">{t("forecast.whatToShow")}</span>
          <div className="flex flex-row justify-center gap-2 flex-wrap">
            {VISIBLE_TYPE_OPTIONS.map((key) => (
              <ChipToggle key={key} active={visibleTypes.has(key)} onClick={() => toggleVisibleType(key)}>
                {t(`forecast.eventTypes.${key}`)}
              </ChipToggle>
            ))}
          </div>

          {visibleTypes.has("aspect") && (
            <>
              <span className="text-xs text-zinc-500 mt-1">{t("forecast.whichAspects")}</span>
              <div className="flex flex-row justify-center gap-2 flex-wrap">
                {VISIBLE_ASPECT_OPTIONS.map((type) => (
                  <ChipToggle key={type} active={visibleAspectTypes.has(type)} onClick={() => toggleVisibleAspectType(type)} title={t(`forecast.aspectTypes.${type}`)}>
                    {getAspectImage(type, 14)}
                  </ChipToggle>
                ))}
              </div>
            </>
          )}

          <span className="text-xs text-zinc-500 mt-1">{t("forecast.filterByDate")}</span>
          <div className="flex flex-row justify-center gap-2">
            <input
              type="number"
              min={1}
              max={31}
              placeholder={t("forecast.day")}
              className="default-input-field w-16 p-1 text-xs"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <select
              className="default-input-field text-xs"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">{t("forecast.allMonths")}</option>
              {monthsNames.map((_, index) => (
                <option key={index} value={index + 1}>{t(`months.${index + 1}`)}</option>
              ))}
            </select>
          </div>
        </FilterDropdown>

        <button onClick={onNextPeriod} className="px-2 py-1 rounded-md hover:bg-zinc-200">▶</button>
      </div>

      <div className="w-full flex-1 min-h-0">
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">{t("forecast.noEvents")}</p>
        ) : (
          <table className={`w-full table-fixed text-sm text-left border-collapse ${isMobilePanel ? "text-[0.8rem]" : ""}`}>
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-200">
                <th className="w-[40%] sm:w-[50%] py-1 pr-2 text-left">{t("forecast.event")}</th>
                <th className={`${isMobilePanel ? "w-[25%]" : "w-[30%]"} py-1 pr-2 text-left`}>{t("forecast.date")}</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <tr key={index} className="border-b border-zinc-100">
                  <td className="py-1.5 pr-2"><EventCell row={row} /></td>
                  <td className="py-1.5 pr-2 whitespace-nowrap">{formatForecastDate(row.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rows.length > itemsPerPage && (
        <div className="w-full flex items-center justify-center gap-1 flex-shrink-0 text-sm">
          <button onClick={() => setPage(0)} disabled={page === 0} className="px-2 py-1 rounded-md hover:bg-zinc-200 disabled:opacity-30 tracking-tighter">|◀</button>
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-2 py-1 rounded-md hover:bg-zinc-200 disabled:opacity-30">◀</button>
          <span className="text-zinc-500">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 rounded-md hover:bg-zinc-200 disabled:opacity-30">▶</button>
          <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="px-2 py-1 rounded-md hover:bg-zinc-200 disabled:opacity-30">▶|</button>
        </div>
      )}
    </div>
  );
}