// src/app/components/menus/TransitsMenu.tsx
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import PresavedChartsDropdown from "@/app/components/charts/PresavedChartsDropdown";
import HouseSystemDropdown from "@/app/components/HouseSystemDropdown";
import TransitsChartForm from "@/app/components/charts/TransitsChartForm";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useChartNavigation } from "@/hooks/useChartNavigation";
import { buildChartUrl, birthDateToQueryFields } from "@/app/utils/chartUrl";
import { convertDegMinToDecimal } from "@/app/utils/chartUtils";
import MenuContainer from "./MenuContainer";
import type { BirthChartProfile, TransitsChartFormData } from "@/interfaces/BirthChartInterfaces";

export default function TransitsMenu() {
  const t = useTranslations();
  const { houseSystem } = useBirthChart();
  const { currentProfile, getNextHumanProfile } = useProfiles();
  const { navigating, navigate } = useChartNavigation();
  const [mode, setMode] = useState<0 | 1>(0);
  const [profile, setProfile] = useState<BirthChartProfile>();

  const getSelectedProfile = () => {
    let selected = profile ?? currentProfile;
    if (!selected?.birthDate || !houseSystem) return;

    if(selected?.gender === "event") {
      const nextProfile = getNextHumanProfile(selected);
      if(!nextProfile) 
        return undefined;
      setProfile(nextProfile);
      selected = nextProfile;
    }

    return selected;
  } 

  const submitMomentTransits = () => {
    const selected = getSelectedProfile();
    if(!selected || !selected.birthDate) return;

    const now = new Date();
    const transitsNow = {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      time: convertDegMinToDecimal(now.getHours(), now.getMinutes()).toString(),
      coordinates: selected.birthDate.coordinates,
    };
    navigate(buildChartUrl({
      type: "transits",
      profileName: selected.name ?? "",
      gender: selected.gender ?? "event",
      houseSystem,
      ...birthDateToQueryFields("birth", selected.birthDate),
      ...birthDateToQueryFields("transits", transitsNow),
    }));
  };

  const submitCalculatedTransits = (formData: TransitsChartFormData) => {
    let selected = formData.profile!;

    if(selected.gender === "event") {
      const nextProfile = getNextHumanProfile(selected);
      if(!nextProfile) 
        return;
      setProfile(nextProfile);
      selected = nextProfile;
    }

    if (!selected.birthDate) return;

    navigate(buildChartUrl({
      type: "transits",
      profileName: selected.name ?? "",
      gender: selected.gender ?? "event",
      houseSystem: (selected.birthDate.houseSystem ?? houseSystem ?? "placidus"),
      ...birthDateToQueryFields("birth", selected.birthDate),
      ...birthDateToQueryFields("transits", formData.transitsDate),
    }));
  };

  return (
    <MenuContainer titleKey="transitsChart.title" mobileTitleKey="transitsChart.titleMobile" loading={navigating}>
      {() => (
        <>
          <div className="w-full flex flex-row justify-between md:justify-start md:gap-4">
            <label htmlFor="load" className="gap-2 flex flex-row">
              <input type="radio" id="load" name="group" value={0} defaultChecked onChange={() => setMode(0)} />
              {t("transitsChart.momentTransits")}
            </label>
            <label htmlFor="create" className="gap-2 flex flex-row items-center justify-end">
              <input type="radio" id="create" name="group" value={1} onChange={() => setMode(1)} />
              {t("transitsChart.calculateTransits")}
            </label>
          </div>

          {mode === 0 && (
            <>
              <PresavedChartsDropdown onChange={setProfile} excludeEventProfiles/>
              <HouseSystemDropdown />
              <button className="default-btn" onClick={submitMomentTransits}>
                {t("birthChart.createMomentChart")}
              </button>
            </>
          )}

          {mode === 1 && <TransitsChartForm onSubmit={submitCalculatedTransits} />}
        </>
      )}
    </MenuContainer>
  );
}