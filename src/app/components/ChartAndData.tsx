import {
  BirthChart,
  ChatDateProps,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
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
import Image from "next/image";
import { ChartDate } from "./ChartDate";
import ChartSelectorArrows from "./ChartSelectorArrows";
import Container from "./Container";

interface Props {
  innerChart: BirthChart;
  outerChart?: BirthChart;
  arabicParts?: ArabicPartsType;
  outerArabicParts?: ArabicPartsType;
  combineWithBirthChart?: () => void;
  combineWithReturnChart?: () => void;
  tableItemsPerPage?: number;
  onTableItemsPerPageChanged?: (newItemsPerPage: number) => void;
  chartDateProps: ChatDateProps;
  outerChartDateProps?: ChatDateProps;
  title?: string;
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
    chartDateProps,
    outerChartDateProps,
    title,
  } = {
    ...props,
  };

  const { isMobileBreakPoint } = useScreenDimensions();
  const [chartForPlanets, setChartForPlanets] = useState<
    BirthChart | undefined
  >(outerChart ?? innerChart);
  const [chartForHouses, setChartForHouses] = useState<BirthChart | undefined>(
    outerChart ?? innerChart
  );
  const [aspectsData, setAspectsData] = useState<PlanetAspectData[]>([]);
  const itemsPerPage = tableItemsPerPage ?? ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT;
  const {
    updateBirthChart,
    updateLunarDerivedChart,
    updateIsCombinedWithBirthChart,
    updateIsCombinedWithReturnChart,
    isCombinedWithBirthChart,
    isCombinedWithReturnChart,
  } = useBirthChart();
  const { chartMenu, resetChartMenus } = useChartMenu();
  const {
    updateArabicParts,
    updateSinastryArabicParts,
    getPartsArray,
    updateSolarReturnParts,
    updateArchArabicParts,
  } = useArabicParts();
  const [partsArray, setPartsArray] = useState<ArabicPart[]>([]);
  const [useInnerPlanets, setUseInnerPlanets] = useState(true);
  const [useInnerHouses, setUseInnerHouses] = useState(true);
  const [useInnerParts, setUseInnerParts] = useState(true);

  const [planetsAntiscion, setPlanetsAntiscion] = useState<
    Record<PlanetType, boolean>
  >({
    sun: false,
    moon: false,
    mercury: false,
    venus: false,
    mars: false,
    jupiter: false,
    saturn: false,
    uranus: false,
    neptune: false,
    pluto: false,
    northNode: false,
    southNode: false,
  });

  const [housesAntiscion, setHousesAntiscion] = useState<
    Record<string, boolean>
  >({
    "Casa 1": false,
    "Casa 2": false,
    "Casa 3": false,
    "Casa 4": false,
    "Casa 5": false,
    "Casa 6": false,
    "Casa 7": false,
    "Casa 8": false,
    "Casa 9": false,
    "Casa 10": false,
    "Casa 11": false,
    "Casa 12": false,
  });

  const togglePlanetAntiscion = (key: PlanetType) => {
    setPlanetsAntiscion((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleHouseAntiscion = (key: string) => {
    setHousesAntiscion((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  function updateParts() {
    if (useInnerParts && arabicParts) {
      setPartsArray(getPartsArray(arabicParts));
    } else if (outerArabicParts) {
      setPartsArray(getPartsArray(outerArabicParts));
    }
  }

  useEffect(() => {
    updateParts();
  }, [useInnerParts, arabicParts, outerArabicParts]);

  function handleOnToggleInnerPartsVisualization(showInnerParts: boolean) {
    setUseInnerParts(showInnerParts);
  }

  useEffect(() => {
    setUseInnerPlanets(outerChart === undefined);
    setUseInnerHouses(outerChart === undefined);
  }, [innerChart, outerChart]);

  useEffect(() => {
    if (
      isCombinedWithBirthChart ||
      isCombinedWithReturnChart ||
      chartMenu === "sinastry"
    ) {
      setChartForPlanets(innerChart);
      setChartForHouses(innerChart);

      setUseInnerPlanets(true);
      setUseInnerHouses(true);
    }
  }, [isCombinedWithBirthChart, isCombinedWithReturnChart, chartMenu]);

  useEffect(() => {
    setChartForPlanets(useInnerPlanets ? innerChart : outerChart);
  }, [useInnerPlanets]);

  useEffect(() => {
    setChartForHouses(useInnerHouses ? innerChart : outerChart);
  }, [useInnerHouses]);

  const handleReset = useCallback(() => {
    updateBirthChart({ chartType: "birth", chartData: undefined });
    updateBirthChart({ chartType: "return", chartData: undefined });
    updateBirthChart({ chartType: "sinastry", chartData: undefined });
    updateBirthChart({ chartType: "progression", chartData: undefined });
    updateArabicParts(undefined);
    updateArchArabicParts(undefined);
    updateSinastryArabicParts(undefined);
    updateSolarReturnParts(undefined);
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

  function renderChart(): JSX.Element {
    const content = (
      <>
        <ChartSelectorArrows className="w-full mb-2 md:px-6">
          {title && (
            <h1 className="text-lg md:text-2xl font-bold text-center">
              {title}
            </h1>
          )}
        </ChartSelectorArrows>
        <div className="mb-2">
          <ChartDate {...chartDateProps} />
          {outerChartDateProps && <ChartDate {...outerChartDateProps} />}
        </div>

        {innerChart && (
          <AstroChart
            props={{
              planets: innerChart.planets,
              housesData: innerChart.housesData,
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
      </>
    );

    return isMobileBreakPoint() ? (
      <div className="flex flex-col items-center">{content}</div>
    ) : (
      <Container className="px-0! lg:mx-2 2xl:mx-6">{content}</Container>
    );
  }

  function renderArabicPartsAndAspectsTable(): JSX.Element {
    const tableContent = (
      <>
        <AspectsTable
          aspects={aspectsData}
          birthChart={innerChart}
          outerChart={outerChart}
          arabicParts={arabicParts!}
          outerArabicParts={outerArabicParts}
          initialItemsPerPage={itemsPerPage}
        />
      </>
    );

    return (
      <>
        {!isMobileBreakPoint() && (
          <div className="md:w-[450px] 2xl:w-[500px] flex flex-col gap-4">
            <Container className="">
              <ArabicPartsLayout
                parts={partsArray}
                showMenuButtons={true}
                isInsideModal={false}
                onToggleInnerPartsVisualization={
                  handleOnToggleInnerPartsVisualization
                }
              />
            </Container>

            {arabicParts && innerChart && (
              <Container className="">{tableContent}</Container>
            )}
          </div>
        )}

        {isMobileBreakPoint() && (
          <>
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
            {arabicParts && innerChart && (
              <div className="md:absolute md:top-full mb-4 md:mb-0">
                {tableContent}
              </div>
            )}
          </>
        )}
      </>
      // <div className="w-full h-auto flex flex-col justify-start gap-2 md:gap-5 relative z-10">
      // </div>
    );
  }

  function renderPlanetsAndHouses(): JSX.Element {
    const planetsContent = (
      <>
        <h2 className="font-bold self-start text-lg mb-2 mt-[-5px] flex flex-row items-center gap-1">
          Planetas:
          <span className="w-fit flex flex-row items-center justify-start gap-1">
            {showSwitchPartsButton() && (
              <>
                <button
                  title="Alterar entre partes internas e externas"
                  className="hover:outline-2 outline-offset-4 hover:cursor-pointer active:bg-gray-300"
                  onClick={() => {
                    toggleInnerPlanetsVisualization();
                  }}
                >
                  <Image
                    alt="change"
                    src="/change.png"
                    width={18}
                    height={18}
                    unoptimized
                  />
                </button>
                {!useInnerPlanets && "(E)"}
              </>
            )}
          </span>
        </h2>
        <ul className="w-full text-[0.85rem] md:text-[1rem]">
          {chartForPlanets?.planets?.map(
            (planet, index) =>
              chartForPlanets.planetsWithSigns && (
                <li
                  key={index}
                  className="w-full flex flex-row items-center justify-between xl:justify-between 2xl:justify-between xl:gap-2 2xl:gap-0"
                >
                  <div
                    className={`w-[6rem] ${
                      planetsAntiscion[planet.type] ? "antiscion" : ""
                    }`}
                  >
                    {planet.name}
                  </div>

                  <div className="w-[1.5rem] md:w-[2rem] flex flex-row items-center">
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
                      isAntiscion: planetsAntiscion[planet.type],
                    })}
                    :&nbsp;
                  </div>
                  <div className="w-[4rem] md:w-[4.5rem] xl:w-[4.5rem] 2xl:w-[4.5rem] text-end flex flex-row items-center justify-end">
                    {formatSignColor(
                      planetsAntiscion[planet.type]
                        ? chartForPlanets.planetsWithSigns[index].antiscion
                        : chartForPlanets.planetsWithSigns[index].position
                    )}
                  </div>

                  <button
                    title="Antiscion"
                    className={`w-[2rem] hidden xl:flex xl:flex-row xl:items-center xl:justify-center 2xl:hidden hover:outline-2 hover:bg-gray-200 active:bg-gray-400 
                      ${planetsAntiscion[planet.type] ? "antiscion" : ""}`}
                    onClick={() => {
                      togglePlanetAntiscion(planet.type);
                    }}
                  >
                    ▶
                  </button>

                  <div className="w-[10rem] pl-1 md:pl-0 md:w-[11rem] flex flex-row items-center xl:hidden 2xl:flex">
                    Antiscion:&nbsp;
                    <span className="w-full text-end">
                      {formatSignColor(
                        chartForPlanets.planetsWithSigns[index].antiscion
                      )}
                    </span>
                  </div>
                </li>
              )
          )}
        </ul>
      </>
    );

    const housesContent = (
      <>
        <h2 className="font-bold self-start text-lg mb-2 flex flex-row items-center gap-1">
          Casas:
          <span className="w-fit flex flex-row items-center justify-start gap-1">
            {showSwitchPartsButton() && (
              <>
                <button
                  title="Alterar entre partes internas e externas"
                  className="hover:outline-2 outline-offset-4 hover:cursor-pointer active:bg-gray-300"
                  onClick={() => {
                    toggleInnerHousesVisualization();
                  }}
                >
                  <Image
                    alt="change"
                    src="/change.png"
                    width={18}
                    height={18}
                    unoptimized
                  />
                </button>
                {!useInnerHouses && "(E)"}
              </>
            )}
          </span>
        </h2>
        {chartForHouses && (
          <ul className="w-full mb-4 text-[0.85rem] md:text-[1rem]">
            {chartForHouses.housesData.housesWithSigns?.map((house, index) => (
              <li
                key={index}
                className="w-full flex flex-row items-center justify-between xl:justify-between 2xl:justify-between xl:gap-2 2xl:gap-0"
              >
                <div
                  className={`w-[8rem] flex flex-row text-nowrap 
                        ${
                          !isMobileBreakPoint()
                            ? ""
                            : index % 3 === 0
                            ? "tracking-tighter"
                            : ""
                        } ${
                    housesAntiscion[`Casa ${index + 1}`] ? "antiscion" : ""
                  } ${index % 3 === 0 ? "font-bold" : ""}`}
                >
                  Casa {index + 1}
                  {index % 3 === 0 ? ` (${getHouseLabel(index)})` : ""}:
                </div>

                <div className="w-1/2 md:w-[5rem] flex flex-row items-center justify-end">
                  {!housesAntiscion[`Casa ${index + 1}`]
                    ? formatSignColor(house)
                    : getHouseAntiscion(chartForHouses.housesData.house[index])}
                </div>

                <button
                  title="Antiscion"
                  className={`w-[2rem] hidden xl:flex xl:flex-row xl:items-center xl:justify-center 2xl:hidden hover:outline-2 hover:bg-gray-200 active:bg-gray-400 
                      ${
                        housesAntiscion[`Casa ${index + 1}`] ? "antiscion" : ""
                      }`}
                  onClick={() => {
                    toggleHouseAntiscion(`Casa ${index + 1}`);
                  }}
                >
                  ▶
                </button>

                <div className="w-[10rem] pl-1 md:pl-0 md:w-[11rem] flex flex-row items-center xl:hidden 2xl:flex">
                  Antiscion:&nbsp;
                  <span className="w-full text-end">
                    {getHouseAntiscion(chartForHouses.housesData.house[index])}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </>
    );

    return (
      <div className="w-full flex flex-col justify-start gap-2 md:gap-5 md:z-20">
        {!isMobileBreakPoint() && (
          <>
            <Container className="xl:w-full 2xl:w-full">
              {planetsContent}
            </Container>
            <Container className="xl:w-full 2xl:w-full">
              {housesContent}
            </Container>
          </>
        )}

        {isMobileBreakPoint() && (
          <>
            <div className="w-full">{planetsContent}</div>
            <div className="w-full md:w-[26rem]">{housesContent}</div>
          </>
        )}
      </div>
    );
  }

  function showSwitchPartsButton(): boolean {
    let result = chartMenu !== "birth";
    if (result) result = isCombinedWithBirthChart || isCombinedWithReturnChart;
    if (!result) result = chartMenu === "sinastry";

    return result;
  }

  function toggleInnerPlanetsVisualization() {
    setUseInnerPlanets((prev) => !prev);
  }

  function toggleInnerHousesVisualization() {
    setUseInnerHouses((prev) => !prev);
  }

  return (
    <div className="w-[95%] md:w-full flex flex-col md:flex-row md:items-start md:justify-between mt-1">
      {isMobileBreakPoint() && (
        <>
          {renderChart()}
          {renderPlanetsAndHouses()}
          {renderArabicPartsAndAspectsTable()}
        </>
      )}

      {!isMobileBreakPoint() && (
        <>
          {renderArabicPartsAndAspectsTable()}
          {renderChart()}
          {renderPlanetsAndHouses()}
        </>
      )}
    </div>
  );
}
