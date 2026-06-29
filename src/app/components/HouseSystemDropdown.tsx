"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { getHouseSystemLabel, HOUSE_SYSTEMS } from "../utils/chartUtils";
import { HouseSystem } from "@/types/HouseSystem";
import { useTranslations } from "next-intl";

const HouseSystemDropdown = () => {
  const { updateHouseSystem, houseSystem } = useBirthChart();
  const t = useTranslations();

  return (
    <>
      <label className="mb-[-8px]">{t("form.houseSystem")}</label>
      <select
        required
        className="w-full bg-zinc-50 default-input-field"
        value={houseSystem}
        onChange={(e) => updateHouseSystem(e.target.value as HouseSystem)}
      >
        {Object.entries(HOUSE_SYSTEMS).map(([key, label]) => (
          <option key={key} value={key}>
            {t(`houseSystems.${key}`)}
          </option>
        ))}
      </select>
    </>
  );
};

export default HouseSystemDropdown;