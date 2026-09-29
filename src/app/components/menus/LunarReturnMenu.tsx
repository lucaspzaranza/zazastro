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

export default function LunarReturnMenu() {
  const t = useTranslations();
  const { currentProfile } = useProfiles();
  const { navigating, navigate } = useChartNavigation();

  const [profile, setProfile] = useState<BirthChartProfile>();
  const selected = profile ?? currentProfile;
  const [day, setDay] = useState<number>();
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState<number>();

  const handleSubmit = () => {
    if (!selected?.birthDate || day === undefined || year === undefined) return;
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
          <PresavedChartsDropdown onChange={setProfile} />
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
                onChange={(e) => {
                  if (e.target.value.length > 0) {
                    let val = Number.parseInt(e.target.value);
                    if (val < 1) val = 1;
                    if (val > 31) val = 31;
                    setDay(val);
                    e.target.value = val.toString();
                  }
                }}
              />
              <select
                required
                className="default-input-field w-1/2"
                value={month}
                onChange={(e) => setMonth(Number.parseInt(e.target.value))}
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
                onChange={(e) => {
                  if (e.target.value.length > 0) {
                    let val = Number.parseInt(e.target.value);
                    if (val < 0) val = 0;
                    setYear(val);
                    e.target.value = val.toString();
                  }
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