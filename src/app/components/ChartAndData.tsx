import {
  BirthChart,
  HousesData,
  Planet,
} from "@/interfaces/BirthChartInterfaces";
import React, { useEffect, useState } from "react";
import {
  angularLabels,
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  formatSignColor,
  getAntiscion,
  getDegreeAndSign,
  getPlanetImage,
  getSign,
  getSignColor,
  getSignGlyphUnicode,
} from "../utils/chartUtils";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import BirthArchArabicParts from "./BirthArchArabicParts";
import ArabicParts from "./ArabicParts";
import AspectsTable from "./aspect-table/AspectsTable";
import AstroChart from "./charts/AstroChart";
import {
  AstroChartProps,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";

interface Props {
  useArchArabicPartsForDataVisualization: boolean;
  birthChart: BirthChart;
  outerChart?: BirthChart;
  arabicParts?: ArabicPartsType;
  outerArabicParts?: ArabicPartsType;
  customPartsForDataVisualization?: ArabicPartsType;
  combineWithBirthChart?: () => void;
  combineWithReturnChart?: () => void;
  tableItemsPerPage?: number;
  onTableItemsPerPageChanged?: (newItemsPerPage: number) => void;
}

export default function ChartAndData(props: Props) {
  const {
    birthChart,
    outerChart,
    arabicParts,
    customPartsForDataVisualization,
    outerArabicParts,
    useArchArabicPartsForDataVisualization,
    combineWithBirthChart,
    combineWithReturnChart,
    tableItemsPerPage,
    onTableItemsPerPageChanged,
  } = {
    ...props,
  };

  const [chart, setChart] = useState(outerChart ?? birthChart);
  const [aspectsData, setAspectsData] = useState<PlanetAspectData[]>([]);
  const itemsPerPage = tableItemsPerPage ?? ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT;

  useEffect(() => {
    setChart(outerChart ?? birthChart);
  }, [birthChart, outerChart]);

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

  function handleOnUpdateAspectsData(newAspectData: PlanetAspectData[]) {
    setAspectsData(newAspectData);
  }

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    onTableItemsPerPageChanged?.(newItemsPerPage);
  }

  return (
    <div className="flex flex-row items-start justify-center mt-8">
      <div className="w-[20rem] flex flex-col justify-start gap-2">
        <div className="w-full">
          <h2 className="font-bold text-lg mb-2">Planetas:</h2>
          <ul>
            {chart?.planets?.map((planet, index) => (
              <li key={index} className="flex flex-row items-center">
                {chart.planetsWithSigns !== undefined && (
                  <div className="w-full flex flex-row">
                    <span className="w-[8rem] flex flex-row items-center">
                      {getPlanetImage(planet.type)}:&nbsp;
                      <span className="w-11/12 text-end pr-4">
                        {formatSignColor(
                          chart.planetsWithSigns[index].position
                        )}
                      </span>
                    </span>
                    <span className="w-[11rem] flex flex-row items-center">
                      Antiscion:&nbsp;
                      <span className="w-full text-end">
                        {formatSignColor(
                          chart.planetsWithSigns[index].antiscion
                        )}
                      </span>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-2">Casas:</h2>
          <ul className="mb-4">
            {chart.housesData.housesWithSigns?.map((house, index) => (
              <li key={house} className="flex flex-row items-center">
                <div className="flex flex-row justify-between">
                  <span className="w-[8rem] flex flex-row items-center">
                    <span className={index % 3 === 0 ? "font-bold" : ""}>
                      {getHouseLabel(index)}:
                    </span>
                    &nbsp;
                    <span className="w-full text-end pr-3">
                      {formatSignColor(house)}
                    </span>
                  </span>
                  <span className="w-[11rem] flex flex-row">
                    Antiscion:&nbsp;
                    <span className="w-full text-end">
                      {getHouseAntiscion(birthChart.housesData.house[index])}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="z-10">
        <AstroChart
          props={{
            planets: birthChart.planets,
            housesData: birthChart.housesData,
            arabicParts,
            outerPlanets: outerChart?.planets,
            outerHouses: outerChart?.housesData,
            outerArabicParts,
            combineWithBirthChart,
            combineWithReturnChart,
            onUpdateAspectsData: handleOnUpdateAspectsData,
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {!useArchArabicPartsForDataVisualization && <ArabicParts />}
        {useArchArabicPartsForDataVisualization && (
          <BirthArchArabicParts
            useCustomASCControls
            customArabicParts={customPartsForDataVisualization}
          />
        )}
        {arabicParts && (
          <AspectsTable
            aspects={aspectsData}
            birthChart={birthChart}
            outerChart={outerChart}
            arabicParts={arabicParts}
            outerArabicParts={outerArabicParts}
            initialItemsPerPage={itemsPerPage}
            onItemsPerPageChanged={handleOnItemsPerPagechanged}
          />
        )}
      </div>
    </div>
  );
}
