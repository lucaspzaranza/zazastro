"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PresavedChartsDropdown from "../charts/PresavedChartsDropdown";
import { buildChartUrl, birthDateToQueryFields } from "@/utils/chartUrl";
import type { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";
import { useProfiles } from "@/contexts/ProfilesContext";
import MenuContainer from "./MenuContainer";
import { useChartNavigation } from "@/hooks/useChartNavigation";
import Image from "next/image"

export default function SolarReturnMenu() {
  const router = useRouter();
  const t = useTranslations();
  const { currentProfile, getNextHumanProfile } = useProfiles();
  
  const [profile, setProfile] = useState<BirthChartProfile>();
  // const selected = profile ?? currentProfile; 
  const [targetYear, setTargetYear] = useState<number>();
  const { navigating, navigate } = useChartNavigation();

  const handleSubmit = () => {
    let selected = profile ?? currentProfile;
    if (!selected?.birthDate || targetYear === undefined) return;

    if(selected?.gender === "event") {
      const nextProfile = getNextHumanProfile(selected);
      if(!nextProfile) return;
      setProfile(nextProfile);
      selected = nextProfile;
    }

    if(!selected.birthDate) return;

    navigate(buildChartUrl({
       type: "solarReturn",
        profileName: selected.name ?? "",
        gender: selected.gender ?? "event",
        ...birthDateToQueryFields("birth", selected.birthDate),
        targetYear,
    }));
  };

  return (
    <MenuContainer titleKey="returnChart.title" loading={navigating}>
      {(iconSize) => (
        <>
          <PresavedChartsDropdown onChange={setProfile} excludeEventProfiles />
          <form
            className="w-full flex flex-col items-center gap-3"
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          >
            <input
              required
              className="default-input-field w-full p-1"
              placeholder={t("returnChart.inputPlaceholder")}
              type="number"
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  let n = Number.parseInt(e.target.value);
                  if (n < 0) n = 0;
                  if (n > 3000) n = 2999;
                  setTargetYear(n);
                  e.target.value = n.toString();
                }
              }}
            />
            <button type="submit" className="default-btn w-full">
              {t("home.solarReturn")}
              <Image src="/sun.png" width={iconSize - 2} height={iconSize - 2} unoptimized alt="chart" />
            </button>
          </form>
        </>
      )}
    </MenuContainer>
  );
}