// src/app/components/menus/ProgressionMenu.tsx
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

export default function ProgressionMenu() {
  const t = useTranslations();
  const { currentProfile, getNextHumanProfile } = useProfiles();
  const { navigating, navigate } = useChartNavigation();

  const [profile, setProfile] = useState<BirthChartProfile>();
  const [years, setYears] = useState<number>();

  const handleSubmit = () => {
    let selected = profile ?? currentProfile;
    if (!selected?.birthDate || years === undefined) return;

    if(selected?.gender === "event") {
      const nextProfile = getNextHumanProfile(selected);
      if(!nextProfile) return;
      setProfile(nextProfile);
      selected = nextProfile;
    }

    if(!selected.birthDate) return;

    navigate(buildChartUrl({
      type: "progression",
      profileName: selected.name ?? "",
      gender: selected.gender ?? "event",
      ...birthDateToQueryFields("birth", selected.birthDate),
      years,
    }));
  };

  return (
    <MenuContainer titleKey="secondaryProgressions.title" loading={navigating}>
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
            {t("secondaryProgressions.generateProgression")}
            <Image src="/fast-forward.png" width={iconSize} height={iconSize} unoptimized alt="chart" />
          </button>
        </form>
      )}
    </MenuContainer>
  );
}