// src/app/components/menus/SinastryMenu.tsx
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

export default function SinastryMenu() {
  const t = useTranslations();
  const { currentProfile, profiles, getNextHumanProfile } = useProfiles();
  const { navigating, navigate } = useChartNavigation();

  const [profile1, setProfile1] = useState<BirthChartProfile>();
  const [profile2, setProfile2] = useState<BirthChartProfile>();
  // const selected1 = profile1 ?? currentProfile;
  // const selected2 = profile2 ?? profiles[0];

  const handleSubmit = () => {
    // if (!selected1?.birthDate || !selected2?.birthDate) return;

    let selected1 = profile1 ?? currentProfile;
    let selected2 = profile2 ?? profiles[0];
    if (!selected1?.birthDate || !selected2?.birthDate) return;

    if(selected1?.gender === "event") {
      const nextProfile = getNextHumanProfile(selected1);
      if(!nextProfile) return;
      setProfile1(nextProfile);
      selected1 = nextProfile;
    }

    if(selected2?.gender === "event") {
      const nextProfile = getNextHumanProfile(selected2);
      if(!nextProfile) return;
      setProfile2(nextProfile);
      selected2 = nextProfile;
    }

    if(!selected1.birthDate || !selected2.birthDate) return;

    navigate(buildChartUrl({
      type: "sinastry",
      profile1Name: selected1.name ?? "",
      gender1: selected1.gender ?? "event",
      ...birthDateToQueryFields("p1", selected1.birthDate),
      profile2Name: selected2.name ?? "",
      gender2: selected2.gender ?? "event",
      ...birthDateToQueryFields("p2", selected2.birthDate),
    }));
  };

  return (
    <MenuContainer titleKey="synastryChart.title" loading={navigating}>
      {(iconSize) => (
        <>
          <div className="flex flex-col gap-1">
            <span>{t("synastryChart.firstChart")}:</span>
            <PresavedChartsDropdown onChange={setProfile1} excludeEventProfiles/>
          </div>

          <div className="flex flex-col gap-1">
            <span>{t("synastryChart.secondChart")}:</span>
            <PresavedChartsDropdown onChange={setProfile2} excludeEventProfiles/>
          </div>

          <button onClick={handleSubmit} className="default-btn">
            {t("synastryChart.makeSynastry")}
            <Image src="/heart.png" width={iconSize} height={iconSize} unoptimized alt="chart" />
          </button>
        </>
      )}
    </MenuContainer>
  );
}