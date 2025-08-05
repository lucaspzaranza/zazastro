import {
  BirthChart,
  HousesData,
  Planet,
} from "@/interfaces/BirthChartInterfaces";
import React from "react";
import {
  angularLabels,
  formatSignColor,
  getAntiscion,
  getDegreeAndSign,
  getPlanetImage,
  getSign,
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
  const getHouseAntiscion = (houseLong: number): React.ReactNode => {
    const antiscion = getAntiscion(houseLong, false);
    const antiscionString = getDegreeAndSign(antiscion, true);
    return formatSignColor(antiscionString);
  };

  const getHouseLabel = (houseIndex: number): string => {
    return houseIndex % 3 === 0
      ? angularLabels[houseIndex]
      : (houseIndex + 1).toString();
  };

  return (
    <div className="flex flex-row items-start justify-center mt-8">
      <div className="w-[20rem] flex flex-col justify-start gap-2">
        <div className="w-full">
          <h2 className="font-bold text-lg mb-2">Planetas:</h2>
          <ul>
            {birthChart.planets?.map((planet, index) => (
              <li key={index} className="flex flex-row items-center">
                {birthChart.planetsWithSigns !== undefined && (
                  <div className="w-full flex flex-row">
                    <span className="w-[8rem] flex flex-row items-center">
                      {getPlanetImage(planet.type)}:&nbsp;
                      {formatSignColor(
                        birthChart.planetsWithSigns[index].position
                      )}
                    </span>
                    <span className="w-1/2 flex flex-row items-center">
                      Antiscion:&nbsp;
                      {formatSignColor(
                        birthChart.planetsWithSigns[index].antiscion
                      )}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full">
          <h2 className="font-bold text-lg mb-2">Casas:</h2>
          <ul className="mb-4">
            {birthChart.housesData.housesWithSigns?.map((house, index) => (
              <li key={house} className="flex flex-row items-center">
                <div className="w-full flex flex-row justify-between">
                  <span className="w-[10rem] flex flex-row items-center">
                    {getHouseLabel(index)}:&nbsp;{formatSignColor(house)}
                  </span>
                  <span className="w-3/4 flex flex-row items-center">
                    Antiscion:&nbsp;
                    {getHouseAntiscion(birthChart.housesData.house[index])}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>{children}</div>

      <div>
        {!useArchArabicParts && <ArabicParts />}
        {useArchArabicParts && <BirthArchArabicParts useCustomASCControls />}
      </div>
    </div>
  );
}
