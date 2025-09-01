import {
  BirthChart,
  HousesData,
  Planet,
} from "@/interfaces/BirthChartInterfaces";
import React, { useEffect, useState } from "react";
import {
  angularLabels,
  arabicPartKeys,
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  chartIsEqualsTo,
  formatSignColor,
  getAntiscion,
  getDegreeAndSign,
  getPlanetImage,
  getSign,
  getSignColor,
  getSignGlyphUnicode,
} from "../utils/chartUtils";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import AspectsTable from "./aspect-table/AspectsTable";
import AstroChart from "./charts/AstroChart";
import {
  AstroChartProps,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import LunarDerivedChart from "./charts/LunarDerivedChart";
import ArabicPartsLayout from "./ArabicPartsLayout";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { useArabicParts } from "@/contexts/ArabicPartsContext";

interface Props {
  useArchArabicPartsForDataVisualization: boolean;
  innerChart: BirthChart;
  outerChart?: BirthChart;
  outerArabicParts?: ArabicPartsType;
  combineWithBirthChart?: () => void;
  combineWithReturnChart?: () => void;
  tableItemsPerPage?: number;
  onTableItemsPerPageChanged?: (newItemsPerPage: number) => void;
  // isSolarReturn: boolean;
}

export default function ChartAndData(props: Props) {
  const {
    innerChart,
    outerChart,
    outerArabicParts,
    useArchArabicPartsForDataVisualization,
    combineWithBirthChart,
    combineWithReturnChart,
    tableItemsPerPage,
    onTableItemsPerPageChanged,
  } = {
    ...props,
  };

  const { birthChart, returnChart, lunarDerivedChart } = useBirthChart();
  const [chart, setChart] = useState(outerChart ?? birthChart);
  const [aspectsData, setAspectsData] = useState<PlanetAspectData[]>([]);
  const itemsPerPage = tableItemsPerPage ?? ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT;
  const lots = useArabicPartCalculations();
  const {
    updateBirthChart,
    updateLunarDerivedChart,
    updateIsCombinedWithBirthChart,
    updateIsCombinedWithReturnChart,
  } = useBirthChart();
  const { resetChartMenus } = useChartMenu();
  const {
    arabicParts,
    archArabicParts,
    updateArabicParts,
    updateArchArabicParts,
  } = useArabicParts();
  const [partsArray, setParts] = useState<ArabicPart[]>([]);
  const { calculateBirthArchArabicPart } = useArabicPartCalculations();
  const { chartMenu, addChartMenu, updateChartMenuDirectly } = useChartMenu();

  let lotsTempObj: ArabicPartsType = {};

  function getChartForArchArabicParts(): BirthChart | undefined {
    if (chartMenu === "solarReturn" || chartMenu === "lunarReturn") {
      return returnChart;
    } else if (chartMenu === "lunarDerivedReturn") {
      return lunarDerivedChart;
    }

    return birthChart;
  }

  useEffect(() => {
    setChart(outerChart ?? innerChart);
  }, [innerChart, outerChart]);

  useEffect(() => {
    if (birthChart === undefined) return;
    if (arabicParts !== undefined) return;

    updateArabicParts({
      fortune: lots.calculateLotOfFortune(birthChart),
      spirit: lots.calculateLotOfSpirit(birthChart),
    });
  }, [birthChart]);

  useEffect(() => {
    let obj = { ...arabicParts };

    if (birthChart === undefined) return;

    if (arabicParts?.fortune && arabicParts.spirit) {
      obj = {
        ...obj,
        necessity: lots.calculateLotOfNecessity(birthChart),
        love: lots.calculateLotOfLove(birthChart),
      };
    }

    if (arabicParts?.fortune) {
      obj = {
        ...obj,
        valor: lots.calculateLotOfValor(birthChart),
        captivity: lots.calculateLotOfCaptivity(birthChart),
      };
    }

    if (arabicParts?.spirit) {
      obj = {
        ...obj,
        victory: lots.calculateLotOfVictory(birthChart),
      };
    }

    // Custom Arabic Parts
    updateArabicParts({
      ...obj,
      marriage: lots.calculateLotOfMarriage(birthChart),
      resignation: lots.calculateLotOfResignation(birthChart),
      children: lots.calculateLotOfChildren(birthChart),
    });
  }, [arabicParts?.fortune]);

  useEffect(() => {
    if (arabicParts === undefined) return;

    setParts([]);

    arabicPartKeys.forEach((key) => {
      const part = arabicParts[key];

      if (part) {
        setParts((prev) => [...prev, part]);
      }
    });

    if (useArchArabicPartsForDataVisualization) {
      updateArchArabicParts({});

      arabicPartKeys.forEach((key) => {
        const part = arabicParts[key];
        if (part && returnChart) {
          const newArchArabicPart = calculateBirthArchArabicPart(
            part,
            getChartForArchArabicParts()?.housesData.ascendant ?? 0
          );
          lotsTempObj[key] = { ...newArchArabicPart };

          if (key === "fortune") {
            console.log("ac: ", returnChart?.housesData.house[0]);
            console.log("radical", part);
            console.log("derivada", newArchArabicPart);
          }
          updateArchArabicParts(lotsTempObj);
        }
      });
    }
  }, [arabicParts]);

  useEffect(() => {
    if (useArchArabicPartsForDataVisualization) {
      if (archArabicParts === undefined) return;
      setParts([]);

      arabicPartKeys.forEach((key) => {
        const part = archArabicParts[key];

        if (part) {
          setParts((prev) => [...prev, part]);
        }
      });
    }
  }, [archArabicParts]);

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
    <div className="w-full relative flex flex-row items-start justify-between mt-1">
      <div className="flex flex-col gap-2 relative z-10">
        <ArabicPartsLayout parts={partsArray} showMenuButtons={true} />

        {arabicParts && innerChart && (
          <div className="absolute top-full">
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

      <div className="absolute w-full flex flex-col items-center justify-end">
        {innerChart && birthChart && (
          <AstroChart
            props={{
              planets: innerChart.planets,
              housesData: innerChart.housesData,
              arabicParts: chartIsEqualsTo(innerChart, birthChart)
                ? arabicParts
                : archArabicParts,
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
          className="w-[25.5rem] mt-6 mb-2 bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
          onClick={() => {
            updateBirthChart({ isReturnChart: false, chartData: undefined });
            updateBirthChart({ isReturnChart: true, chartData: undefined });
            updateLunarDerivedChart(undefined);
            updateIsCombinedWithBirthChart(false);
            updateIsCombinedWithReturnChart(false);
            resetChartMenus();
          }}
        >
          Menu Principal
        </button>
      </div>

      <div className="w-[26rem] flex flex-col justify-start gap-2 z-10">
        <div className="w-full">
          <h2 className="font-bold text-lg mb-2 mt-[-5px]">Planetas:</h2>
          <ul>
            {chart?.planets?.map((planet, index) => (
              <li key={index} className="flex flex-row items-center">
                {chart.planetsWithSigns !== undefined && (
                  <div className="w-full flex flex-row">
                    <span className="w-[14rem] flex flex-row items-center">
                      <span className="w-full">{planet.name}</span>
                      {getPlanetImage(planet.type)}:&nbsp;
                      <span className="w-9/12 text-end pr-4">
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

        <div className="w-[26rem]">
          <h2 className="font-bold text-lg mb-2">Casas:</h2>
          {chart && (
            <ul className="w-full mb-4">
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
                            "w-full flex flex-row " + (index % 3 === 0)
                              ? "text-[0.975rem]"
                              : ""
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
    </div>
  );
}
