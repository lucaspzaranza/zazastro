// src/components/menus/LunarDerivedMenu.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { monthsNames } from "@/app/utils/chartUtils";
import { buildChartUrl, birthDateToQueryFields } from "@/utils/chartUrl";
import type { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";
import PresavedChartsDropdown from "../charts/PresavedChartsDropdown";
import { useProfiles } from "@/contexts/ProfilesContext";

export default function LunarDerivedMenu() {
  const router = useRouter();
  const t = useTranslations();
  const { currentProfile, profiles } = useProfiles();
  const [profile, setProfile] = useState<BirthChartProfile>();
  const selected = profile ?? currentProfile; 
  const [solarYear, setSolarYear] = useState<number>();
  const [day, setDay] = useState<number>();
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState<number>();

  const handleSubmit = () => {
    if (!selected?.birthDate || solarYear === undefined || day === undefined || year === undefined) return;

    router.push(buildChartUrl({
      type: "lunarDerivedReturn",
      profileName: selected.name ?? "",
      gender: selected.gender ?? "event",
      ...birthDateToQueryFields("birth", selected.birthDate),
      solarTargetYear: solarYear,
      derivedDay: day,
      derivedMonth: month,
      derivedYear: year,
    }));
  };

  return (
    <>
      <PresavedChartsDropdown onChange={setProfile} />

      <form
        className="w-full flex flex-col gap-3"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      >
        <input
          required
          type="number"
          className="default-input-field w-full p-1"
          placeholder={t("returnChart.inputPlaceholder")}
          onChange={(e) => {
            if (e.target.value.length > 0) {
              const n = Math.min(2999, Math.max(0, Number.parseInt(e.target.value)));
              setSolarYear(n);
              e.target.value = n.toString();
            }
          }}
        />

        <div className="w-full flex flex-row gap-1">
          <input
            required
            type="number"
            className="default-input-field w-1/3 px-1"
            placeholder={t("form.day")}
            onChange={(e) => {
              if (e.target.value.length > 0) {
                const val = Math.min(31, Math.max(1, Number.parseInt(e.target.value)));
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
                const val = Math.max(0, Number.parseInt(e.target.value));
                setYear(val);
                e.target.value = val.toString();
              }
            }}
          />
        </div>

        <button type="submit" className="default-btn">
          {t("returnChart.lunarDerivedReturn")}
        </button>
      </form>
    </>
  );
}