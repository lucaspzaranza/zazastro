// src/app/components/menus/ProfectionMenu.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import PresavedChartsDropdown from "@/app/components/charts/PresavedChartsDropdown";
import { buildChartUrl, birthDateToQueryFields } from "@/app/utils/chartUrl";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useChartNavigation } from "@/hooks/useChartNavigation";
import MenuContainer from "./MenuContainer";
import type { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";

export default function ProfectionMenu() {
  const t = useTranslations();
  const { currentProfile } = useProfiles();
  const { navigating, navigate } = useChartNavigation();

  const [profile, setProfile] = useState<BirthChartProfile>();
  const selected = profile ?? currentProfile;
  const [years, setYears] = useState<number>();

  const handleSubmit = () => {
    if (!selected?.birthDate || years === undefined) return;
    navigate(buildChartUrl({
      type: "profection",
      profileName: selected.name ?? "",
      gender: selected.gender ?? "event",
      ...birthDateToQueryFields("birth", selected.birthDate),
      years,
    }));
  };

  return (
    <MenuContainer titleKey="profections.title" loading={navigating}>
      {(iconSize) => (
        <form
          className="w-full flex flex-col justify-between gap-2"
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        >
          <span>{t("home.selectChart")}:</span>
          <PresavedChartsDropdown onChange={setProfile} excludeEventProfiles/>

          <div className="flex flex-row items-center gap-2">
            <label className="text-nowrap">{t("home.numOfYears")}:</label>
            <input
              required
              type="number"
              placeholder="ex: 30"
              className="w-full default-input-field p-1"
              value={years ?? ""}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value);
                if (Number.isNaN(parsed)) { setYears(undefined); return; }
                setYears(Math.max(0, parsed));
              }}
            />
          </div>

          <button type="submit" className="default-btn">
            {t("profections.generateProfection")}
            <Image src="/profection.png" width={iconSize + 2} height={iconSize + 2} unoptimized alt="chart" />
          </button>
        </form>
      )}
    </MenuContainer>
  );
}