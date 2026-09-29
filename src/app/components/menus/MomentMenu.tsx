// src/components/menus/MomentMenu.tsx
"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { convertDegMinToDecimal } from "@/app/utils/chartUtils";
import { buildChartUrl, birthDateToQueryFields } from "@/utils/chartUrl";
import type { BirthDate } from "@/interfaces/BirthChartInterfaces";
import CitySearch from "../CitySearch";
import HouseSystemDropdown from "../HouseSystemDropdown";
import MenuContainer from "./MenuContainer";
import { useChartNavigation } from "@/hooks/useChartNavigation";

export default function MomentMenu() {
  const router = useRouter();
  const t = useTranslations();
  const { currentCity, selectCity, houseSystem } = useBirthChart();
  const { navigating, navigate } = useChartNavigation();

  const handleSubmit = () => {
    if (!currentCity) return;

    // "Now" is captured once, here, and pinned into the URL
    const now = new Date();
    const momentDate: BirthDate = {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      time: convertDegMinToDecimal(now.getHours(), now.getMinutes()).toString(),
      coordinates: currentCity,
    };

    navigate(buildChartUrl({
      type: "moment",
      houseSystem: houseSystem ?? "placidus",
      ...birthDateToQueryFields("birth", momentDate),
    }));
  };

  return (
    <MenuContainer titleKey="momentChart.title" loading={navigating}>
      <CitySearch onSelect={selectCity} />
      <HouseSystemDropdown />
      <button
        className="default-btn"
        disabled={!currentCity}
        onClick={handleSubmit}
      >
        {t("birthChart.createMomentChart")}
      </button>
    </MenuContainer>
  );
}