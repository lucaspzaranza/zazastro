"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { getHouseSystemLabel, HOUSE_SYSTEMS } from "../utils/chartUtils";
import { HouseSystem } from "@/types/HouseSystem";

const HouseSystemDropdown = () => {
  const { updateHouseSystem, houseSystem } = useBirthChart();

  return (
    <>
      <label className="mb-[-8px]">Sistema de Casas</label>
      <select
        required
        className="p-1 border-2 w-full rounded-sm"
        value={houseSystem}
        onChange={(e) => updateHouseSystem(e.target.value as HouseSystem)}
      >
        {Object.entries(HOUSE_SYSTEMS).map(([key, label]) => (
          <option key={key} value={key}>
            {getHouseSystemLabel(key as HouseSystem)}
          </option>
        ))}
      </select>
    </>
  );
};

export default HouseSystemDropdown;