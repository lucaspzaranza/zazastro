import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import React, { JSX, useCallback, useEffect, useState } from "react";
import {
  angularLabels,
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  formatSignColor,
  getAntiscion,
  getDegreeAndSign,
  getPlanetImage,
} from "../utils/chartUtils";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import AspectsTable from "./aspect-table/AspectsTable";
import AstroChart from "./charts/AstroChart";
import { PlanetAspectData } from "@/interfaces/AstroChartInterfaces";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import ArabicPartsLayout from "./ArabicPartsLayout";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";

interface Props {
  useArchArabicPartsForDataVisualization: boolean;
  innerChart: BirthChart;
  outerChart?: BirthChart;
  arabicParts?: ArabicPartsType;
  outerArabicParts?: ArabicPartsType;
  combineWithBirthChart?: () => void;
  combineWithReturnChart?: () => void;
  tableItemsPerPage?: number;
  onTableItemsPerPageChanged?: (newItemsPerPage: number) => void;
}

export default function ChartAndData(props: Props) {
  const {
    innerChart,
    outerChart,
    arabicParts,
    outerArabicParts,
    combineWithBirthChart,
    combineWithReturnChart,
    tableItemsPerPage,
    onTableItemsPerPageChanged,
  } = {
    ...props,
  };

  const { isMobileBreakPoint } = useScreenDimensions();
  const { birthChart } = useBirthChart();
  const [chart, setChart] = useState(outerChart ?? birthChart);
  const [aspectsData, setAspectsData] = useState<PlanetAspectData[]>([]);
  const itemsPerPage = tableItemsPerPage ?? ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT;
  const {
    updateBirthChart,
    updateLunarDerivedChart,
    updateIsCombinedWithBirthChart,
    updateIsCombinedWithReturnChart,
    updateSinastryChart,
  } = useBirthChart();
  const { resetChartMenus } = useChartMenu();
  const { updateArabicParts, updateSinastryArabicParts, getPartsArray } =
    useArabicParts();
  const [partsArray, setPartsArray] = useState<ArabicPart[]>([]);
  // const [useInnerPlanets, setUseInnerPlanets] = useState(true);
  // const [useInnerHouses, setUseInnerHouses] = useState(true);
  const [useInnerParts, setUseInnerParts] = useState(true);

  function updateParts() {
    if (useInnerParts && arabicParts) {
      setPartsArray(getPartsArray(arabicParts));
    } else if (outerArabicParts) {
      setPartsArray(getPartsArray(outerArabicParts));
    }
  }

  useEffect(() => {
    setChart(outerChart ?? innerChart);
  }, [innerChart, outerChart]);

  useEffect(() => {
    updateParts();
  }, [useInnerParts, arabicParts, outerArabicParts]);

  function handleOnToggleInnerPartsVisualization(showInnerParts: boolean) {
    setUseInnerParts(showInnerParts);
  }

  const handleReset = useCallback(() => {
    updateBirthChart({ isReturnChart: false, chartData: undefined });
    updateBirthChart({ isReturnChart: true, chartData: undefined });
    updateSinastryChart(undefined);
    updateArabicParts(undefined);
    updateSinastryArabicParts(undefined);
    updateLunarDerivedChart(undefined);
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);
    resetChartMenus();
  }, []);

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

  function renderChart(): JSX.Element {
    return (
      <div className="md:absolute w-full flex flex-col items-center md:justify-end">
        {innerChart && birthChart && (
          <AstroChart
            props={{
              planets: innerChart.planets,
              housesData: innerChart.housesData,
              // arabicParts: getInnerArabicParts()!,
              arabicParts: arabicParts,
              outerPlanets: outerChart?.planets,
              outerHouses: outerChart?.housesData,
              outerArabicParts,
              fixedStars: innerChart.fixedStars,
              combineWithBirthChart,
              combineWithReturnChart,
              onUpdateAspectsData: handleOnUpdateAspectsData,
            }}
          />
        )}

        <button
          type="button"
          className="w-full md:w-[25.5rem] mt-6 mb-2 bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
          onClick={handleReset}
        >
          Menu Principal
        </button>
      </div>
    );
  }

  function renderArabicPartsAndAspectsTable(): JSX.Element {
    return (
      <div className="w-full flex flex-col gap-2 relative z-10">
        {!isMobileBreakPoint() && (
          <ArabicPartsLayout
            parts={partsArray}
            showMenuButtons={true}
            isInsideModal={false}
            onToggleInnerPartsVisualization={
              handleOnToggleInnerPartsVisualization
            }
          />
        )}

        {isMobileBreakPoint() && (
          <ArabicPartsLayout
            className="w-full text-[0.85rem] md:text-[1rem]"
            parts={partsArray}
            partColWidth="w-[52.5%]! mr-2"
            antisciaColWidth="w-1/2!"
            showMenuButtons={true}
            isInsideModal={false}
            onToggleInnerPartsVisualization={
              handleOnToggleInnerPartsVisualization
            }
          />
        )}

        {arabicParts && birthChart && innerChart && (
          <div className="md:absolute md:top-full mb-4 md:mb-0">
            <AspectsTable
              aspects={aspectsData}
              birthChart={innerChart}
              outerChart={outerChart}
              arabicParts={arabicParts}
              outerArabicParts={outerArabicParts}
              initialItemsPerPage={itemsPerPage}
              onItemsPerPageChanged={handleOnItemsPerPagechanged}
            />
          </div>
        )}
      </div>
    );
  }

  function renderPlanetsAndHouses(): JSX.Element {
    return (
      <div className="w-full md:w-[26rem] flex flex-col justify-start gap-2 md:z-20">
        <div className="w-full">
          <h2 className="font-bold text-lg mb-2 mt-[-5px]">Planetas:</h2>
          <ul className="text-[0.85rem] md:text-[1rem]">
            {chart?.planets?.map((planet, index) => (
              <li key={index} className="flex flex-row items-center">
                {chart.planetsWithSigns !== undefined && (
                  <div className="w-full flex flex-row">
                    <span className="w-[55%] md:w-[14rem] flex flex-row items-center">
                      <span className="w-full flex flex-row items-center justify-start md:justify-between mr-[-20px]">
                        {planet.type === "northNode" && (
                          <span className="w-8/12 md:w-full text-[0.75rem] md:text-[1rem]">
                            {planet.name}
                          </span>
                        )}
                        {planet.type !== "northNode" && (
                          <span className="w-8/12 md:w-full">
                            {planet.name}
                          </span>
                        )}
                        {getPlanetImage(planet.type, {
                          isRetrograde: planet.isRetrograde,
                          size: !isMobileBreakPoint()
                            ? planet.type === "northNode" ||
                              planet.type === "southNode"
                              ? 19
                              : 15
                            : planet.type === "northNode" ||
                              planet.type === "southNode"
                            ? 15
                            : 13,
                        })}
                        :&nbsp;
                      </span>
                      <span className="w-7/12 md:w-9/12 text-end pr-2 md:pr-4">
                        {formatSignColor(
                          chart.planetsWithSigns[index].position
                        )}
                      </span>
                    </span>
                    <span className="w-[10rem] pl-1 md:pl-0 md:w-[11rem] flex flex-row items-center">
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

        <div className="w-full md:w-[26rem]">
          <h2 className="font-bold text-lg mb-2">Casas:</h2>
          {chart && (
            <ul className="w-full mb-4 text-[0.85rem] md:text-[1rem]">
              {chart.housesData.housesWithSigns?.map((house, index) => (
                <li key={house} className="w-full flex flex-row items-center">
                  <div className="w-full flex flex-row justify-between">
                    <span className="w-1/2 flex flex-row items-center">
                      <span
                        className={
                          (index % 3 === 0 ? "font-bold" : "") + " w-full"
                        }
                      >
                        <span
                          className={
                            "w-full flex flex-row" +
                            (!isMobileBreakPoint()
                              ? index % 3 === 0
                                ? "text-[0.975rem]"
                                : ""
                              : index % 3 === 0
                              ? "text-nowrap tracking-tighter"
                              : "")
                          }
                        >
                          Casa {index + 1}
                          {index % 3 === 0 ? ` (${getHouseLabel(index)})` : ""}:
                        </span>
                      </span>
                      &nbsp;
                      <span className="text-end pr-0">
                        {formatSignColor(house)}
                      </span>
                    </span>
                    {birthChart && (
                      <span className="w-1/2 pl-4 flex flex-row pr-4">
                        Antiscion:&nbsp;
                        <span className="w-full text-end">
                          {getHouseAntiscion(chart.housesData.house[index])}
                        </span>
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[95%] md:w-full relative flex flex-col md:flex-row md:items-start md:justify-between mt-1">
      {isMobileBreakPoint() && (
        <>
          {renderChart()}
          {renderPlanetsAndHouses()}
          {renderArabicPartsAndAspectsTable()}
        </>
      )}

      {!isMobileBreakPoint() && (
        <>
          <div className="w-[415px]">{renderArabicPartsAndAspectsTable()}</div>
          {renderChart()}
          {renderPlanetsAndHouses()}
        </>
      )}
    </div>
  );
}
