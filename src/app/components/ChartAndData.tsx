import {
  BirthChart,
  HousesData,
  Planet,
} from "@/interfaces/BirthChartInterfaces";
import React from "react";
import {
  formatSignColor,
  getPlanetImage,
  getSignColor,
  getSignGlyphUnicode,
} from "../utils/chartUtils";
import ArabicParts from "./ArabicParts";
import BirthArchArabicParts from "./BirthArchArabicParts";

interface Props {
  birthChart: BirthChart;
  useArchArabicParts: boolean;
  children: React.ReactNode;
}

export default function ChartAndData({
  birthChart,
  useArchArabicParts,
  children,
}: Props) {
  return (
    <div className="w-full flex flex-row items-start justify-center mt-8">
      <div className="flex flex-col justify-start gap-2">
        <div>
          <h2 className="font-bold text-lg mb-2">Planetas:</h2>
          <ul>
            {birthChart.planets?.map((planet, index) => (
              <li key={index} className="flex flex-row items-center">
                {birthChart.planetsWithSigns !== undefined && (
                  <>
                    {getPlanetImage(planet.type)}:&nbsp;
                    {formatSignColor(
                      birthChart.planetsWithSigns[index].position
                    )}
                    &nbsp;-&nbsp;Antiscion:&nbsp;
                    {formatSignColor(
                      birthChart.planetsWithSigns[index].antiscion
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-2">Casas:</h2>
          <ul className="mb-4">
            {birthChart.housesData.housesWithSigns?.map((house, index) => (
              <li key={house}>
                Casa {index + 1}: {formatSignColor(house)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {children}
      {!useArchArabicParts && <ArabicParts />}
      {useArchArabicParts && <BirthArchArabicParts useCustomASCControls />}
    </div>
  );
}
