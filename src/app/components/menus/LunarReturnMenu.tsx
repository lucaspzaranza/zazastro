// src/app/components/menus/LunarReturnMenu.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import PresavedChartsDropdown from "../charts/PresavedChartsDropdown";
import { buildChartUrl, birthDateToQueryFields } from "@/utils/chartUrl";
import { monthsNames } from "@/app/utils/chartUtils";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useChartNavigation } from "@/hooks/useChartNavigation";
import MenuContainer from "./MenuContainer";
import type { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";
import { clampDayToMonth, isValidDayOfMonth } from "@/app/utils/dateUtils";

export default function LunarReturnMenu() {
  const t = useTranslations();
  const { currentProfile, getNextHumanProfile } = useProfiles();
  const { navigating, navigate } = useChartNavigation();

  const [profile, setProfile] = useState<BirthChartProfile>();
  const selected = profile ?? currentProfile;
  const [day, setDay] = useState<number>();
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState<number>();

  const handleSubmit = () => {
    let selected = profile ?? currentProfile;
    if (!selected?.birthDate || year === undefined || day === undefined || !isValidDayOfMonth(day, month, year)) return;

    if(selected?.gender === "event") {
      const nextProfile = getNextHumanProfile(selected);
      if(!nextProfile) return;
      setProfile(nextProfile);
      selected = nextProfile;
    }

    if(!selected.birthDate) return;

    navigate(buildChartUrl({
      type: "lunarReturn",
      profileName: selected.name ?? "",
      gender: selected.gender ?? "event",
      ...birthDateToQueryFields("birth", selected.birthDate),
      targetDay: day,
      targetMonth: month,
      targetYear: year,
    }));
  };

  return (
    <MenuContainer titleKey="returnChart.titleLunar" loading={navigating}>
      {(iconSize) => (
        <>
          <PresavedChartsDropdown onChange={setProfile} excludeEventProfiles/>
          <form
            className="w-full flex flex-col justify-between gap-3"
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          >
            <div className="w-full flex flex-row justify-between gap-1">
              <input
                required
                className="default-input-field w-1/3 px-1"
                placeholder={t("form.day")}
                type="number"
                value={day ?? ""}
                onChange={(e) => {
                  if (e.target.value.length === 0) return setDay(undefined);
                  const val = Math.min(31, Math.max(1, Number.parseInt(e.target.value, 10)));
                  setDay(clampDayToMonth(val, month, year ?? null) ?? undefined);
                }}
              />
              <select
                required
                className="default-input-field w-1/2"
                value={month}
                onChange={(e) => {
                  const nextMonth = Number.parseInt(e.target.value, 10);
                  setMonth(nextMonth);
                  setDay((currentDay) => clampDayToMonth(currentDay ?? null, nextMonth, year ?? null) ?? undefined);
                }}
              >
                {monthsNames.map((_, index) => (
                  <option key={index} value={index + 1}>{t(`months.${index + 1}`)}</option>
                ))}
              </select>
              <input
                required
                type="number"
                className="default-input-field w-20 p-1"
                placeholder={t("form.year")}
                value={year ?? ""}
                onChange={(e) => {
                  if (e.target.value.length === 0) return setYear(undefined);
                  const val = Math.max(0, Number.parseInt(e.target.value, 10));
                  setYear(val);
                  setDay((currentDay) => clampDayToMonth(currentDay ?? null, month, val) ?? undefined);
                }}
              />
            </div>
            <button type="submit" className="default-btn">
              {t("home.lunarReturn")}
              <Image src="/moon.png" width={iconSize - 2} height={iconSize - 2} unoptimized alt="chart" />
            </button>
          </form>
        </>
      )}
    </MenuContainer>
  );
}
