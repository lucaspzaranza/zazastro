// src/components/menus/MomentMenu.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { convertDegMinToDecimal } from "@/app/utils/chartUtils";
import { buildChartUrl, birthDateToQueryFields } from "@/utils/chartUrl";
import type { BirthDate } from "@/interfaces/BirthChartInterfaces";
import CitySearch from "../CitySearch";
import HouseSystemDropdown from "../HouseSystemDropdown";
import MenuContainer from "./MenuContainer";
import { useChartNavigation } from "@/hooks/useChartNavigation";
import type { SelectedCity } from "@/interfaces/BirthChartInterfaces";

const MOMENT_CITY_STORAGE_KEY = "zazastro:moment-city";

export default function MomentMenu() {
  const t = useTranslations();
  const { currentCity, selectCity, houseSystem } = useBirthChart();
  const { navigating, navigate } = useChartNavigation();
  const [savedCity, setSavedCity] = useState<SelectedCity | undefined>();
  const selectCityRef = useRef(selectCity);
  selectCityRef.current = selectCity;

  useEffect(() => {
    try {
      const rawCity = localStorage.getItem(MOMENT_CITY_STORAGE_KEY);
      if (!rawCity) return;

      const city: unknown = JSON.parse(rawCity);
      if (
        typeof city === "object" && city !== null &&
        typeof (city as SelectedCity).name === "string" &&
        typeof (city as SelectedCity).latitude === "number" &&
        Number.isFinite((city as SelectedCity).latitude) &&
        typeof (city as SelectedCity).longitude === "number" &&
        Number.isFinite((city as SelectedCity).longitude)
      ) {
        const validCity = city as SelectedCity;
        setSavedCity(validCity);
        selectCityRef.current(validCity);
      }
    } catch {
      try {
        localStorage.removeItem(MOMENT_CITY_STORAGE_KEY);
      } catch {
        // Ignore unavailable localStorage; the menu remains usable.
      }
    }
  }, []);

  const handleCitySelect = (city: SelectedCity) => {
    selectCity(city);
    setSavedCity(city);
    try {
      localStorage.setItem(MOMENT_CITY_STORAGE_KEY, JSON.stringify(city));
    } catch {
      // Ignore unavailable localStorage; the current selection still works.
    }
  };

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
      <CitySearch initialCoordinates={savedCity} onSelect={handleCitySelect} />
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
