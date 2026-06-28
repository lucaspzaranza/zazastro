"use client";

import {
  BirthChart,
  ChatDateProps,
  GenderType,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import React, { JSX, useCallback, useEffect, useState } from "react";
import {
  angularLabels,
  convertTransitsToChart,
  formatSignColor,
  getAntiscion,
  getDegreeAndSign,
  getGenderIconPath,
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
import Container from "./Container";
import { SkeletonLine, SkeletonTable } from "./skeletons";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT, SKELETON_LOADER_TIME } from "../utils/constants";
import Spinner from "./Spinner";
import { useTranslations } from "next-intl";
import { useAspectsData } from "@/contexts/AspectsContext";
import { useAstroChartToggles } from "@/hooks/useAstroChartToggles";
import { useResolvedChartDate, ResolvedChartDate } from "@/hooks/useResolvedChartDate";
import ChartHeader from "./ChartHeader";
import AstroChartMenu from "./menus/AstroChartMenu";

interface Props {
  innerChart: BirthChart;
  outerChart?: BirthChart;
  arabicParts?: ArabicPartsType;
  outerArabicParts?: ArabicPartsType;
  tableItemsPerPage?: number;
  onTableItemsPerPageChanged?: (newItemsPerPage: number) => void;
  chartDateProps: ChatDateProps;
  outerChartDateProps?: ChatDateProps;
  title?: string | React.ReactNode;
  gender?: GenderType;
}

export default function ChartAndData(props: Props) {
  const {
    innerChart,
    outerChart,
    arabicParts,
    outerArabicParts,
    tableItemsPerPage,
    chartDateProps,
    outerChartDateProps,
    title,
    gender,
  } = {
    ...props,
  };

  const [loading, setLoading] = useState(true);
  const { isMobileBreakPoint, isScreen1366 } = useScreenDimensions();
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
    loadingNextChart,
    isMountingChart,
    chartIsLocked,
    setChartIsLocked
  } = useBirthChart();
  const { chartMenu, resetChartMenus, isReturnChart,
    isSinastryChart, isProgressionChart, isProfectionChart, isLunarDerivedReturnChart } = useChartMenu();
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
  const [nextChartContentLoaded, setNextChartContentLoaded] = useState(false);
  const t = useTranslations();
  // const [translatedTitle, setTranslatedTitle] = useState(title);
  
  const { setHasIsolatedAspect, setSelectedAspect } = useAspectsData();

  const genderIconSize = 20;

  // Estado de toggles do mapa (antiscion, partes árabes, termos, decanatos,
  // estrelas fixas), antes interno ao AstroChart, agora levantado para este
  // componente e compartilhado entre AstroChartMenu (controles) e AstroChart
  // (renderização do SVG).
  const toggles = useAstroChartToggles();

  // Resolve cada bloco de data individualmente (hooks não podem ser
  // chamados dentro de loop/.map nem condicionalmente — por isso as três
  // chamadas abaixo SEMPRE ocorrem, mesmo quando o bloco correspondente não
  // existe; useResolvedChartDate já retorna undefined quando chartDate não
  // é fornecido, então passamos chartDate: undefined nesses casos).
  const innerDateBlock = useResolvedChartDate(chartDateProps);
  const outerDateBlock = useResolvedChartDate(
    outerChartDateProps ?? { chartType: "birth", chartDate: undefined }
  );
  const transitsDateBlock = useResolvedChartDate({
    chartType: "transits",
    label: t("birthChart.transits"),
    chartDate: innerChart.transits?.date,
  });

  const dateBlocks: ResolvedChartDate[] = [
    innerDateBlock,
    outerChartDateProps ? outerDateBlock : undefined,
    innerChart.transits ? transitsDateBlock : undefined,
  ].filter((b): b is ResolvedChartDate => b !== undefined);

  // Reseta os toggles "por mapa" (antiscion, partes árabes e variantes)
  // sempre que o conteúdo do mapa muda — mesmo comportamento que antes
  // vivia dentro do AstroChart, reagindo às mesmas dependências.
  useEffect(() => {
    toggles.resetPerChartToggles();
  }, [innerChart, outerChart, arabicParts, outerArabicParts, innerChart.fixedStars]);

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

    setTimeout(() => {
      setLoading(false);
    }, SKELETON_LOADER_TIME);
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
    if (!loadingNextChart) {
      setChartForPlanets(innerChart);
      setChartForHouses(innerChart);
      setNextChartContentLoaded(true);
    } else {
      setNextChartContentLoaded(false);
    }
  }, [loadingNextChart])

  useEffect(() => {
    setChartForPlanets(innerChart);
    setChartForHouses(innerChart);

    setUseInnerPlanets(true);
    setUseInnerHouses(true);
  }, [isCombinedWithBirthChart, isCombinedWithReturnChart, chartMenu]);

  useEffect(() => {
    if(innerChart.transits)
      setChartForPlanets(useInnerPlanets? innerChart : convertTransitsToChart(innerChart.transits));
    else
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
    updateBirthChart({ chartType: "profection", chartData: undefined });
    updateLunarDerivedChart(undefined);
    updateArabicParts(undefined);
    updateArchArabicParts(undefined);
    updateSinastryArabicParts(undefined);
    updateSolarReturnParts(undefined);
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);
    setHasIsolatedAspect(false);
    setSelectedAspect(null);
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
      <div className="w-full md:min-w-[51rem] flex flex-col items-center justify-center relative">
        {(loadingNextChart || isMountingChart) &&
          <div
            className={`absolute w-full h-full top-0 md:top-auto md:h-[108%] px-3 md:px-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-10 
              md:rounded-2xl transition-all duration-200 ease-in-out opacity-0 animate-[fadeIn_0.2s_forwards]`}>
            <Spinner size="16" />
            <h2 className="font-bold text-lg pl-10 mt-3">{t("home.loading")}</h2>
          </div>
        }

        <>
          <ChartHeader
            title={title}
            dateBlocks={dateBlocks}
            genderIconPath={
              chartDateProps.chartType !== "sinastry" ? getGenderIconPath(gender ?? "event") : undefined
            }
            genderIconSize={genderIconSize}
          />

          <div className="w-full md:px-4 mt-2">
            <AstroChartMenu
              toggleCombineWithBirthChart={isReturnChart() || isProgressionChart() || isProfectionChart()}
              toggleCombineWithReturnChart={isLunarDerivedReturnChart()}
              onGoHome={handleReset}
              toggles={toggles}
            />
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
                onUpdateAspectsData: handleOnUpdateAspectsData,
                useReturnSelectorArrows: isReturnChart() || isProgressionChart() || isProfectionChart(),
                showArabicParts: toggles.showArabicParts,
                showPlanetsAntiscia: toggles.showPlanetsAntiscia,
                showArabicPartsAntiscia: toggles.showArabicPartsAntiscia,
                showDegrees: toggles.showDegrees,
                useTerms: toggles.useTerms,
                useDecans: toggles.useDecans,
                showFixedStars: toggles.showFixedStars,
                currentTerms: toggles.currentTerms,
              }}
            />
          )}
        </>
      </div>
    );

    return isMobileBreakPoint() ? (
      <div className="flex flex-col items-center">{content}</div>
    ) : (
      <Container className={`px-0! lg:mx-2 2xl:mx-6 ${isSinastryChart() ? "px-0!" : ""}`}>{content}</Container>
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
          <div className="md:w-[450px] 2xl:w-[450px] 3xl:w-[500px] flex flex-col gap-4 2xl:mr-[-15px] 3xl:mr-zero">
            <Container>
              {(loading || loadingNextChart) ?
                <div className="w-full">
                  <SkeletonLine width="w-1/3" className="mb-4" />
                  <SkeletonTable rows={8} />
                </div>
                :
                <ArabicPartsLayout
                  parts={partsArray}
                  showMenuButtons={true}
                  showSwitchParts
                  onToggleInnerPartsVisualization={
                    handleOnToggleInnerPartsVisualization
                  }
                />
              }
            </Container>

            {arabicParts && innerChart && (
              <Container className="">{tableContent}</Container>
            )}
          </div>
        )}

        {isMobileBreakPoint() && (
          <>
            {(loading || loadingNextChart) ?
              <div className="w-full">
                <SkeletonLine width="w-1/3" className="mb-4" />
                <SkeletonTable rows={8} />
              </div>
              :
              <ArabicPartsLayout
                parts={partsArray}
                showMenuButtons={true}
                showSwitchParts
                onToggleInnerPartsVisualization={
                  handleOnToggleInnerPartsVisualization
                }
              />
            }

            {arabicParts && innerChart && (
              <div className="md:absolute md:top-full mb-4 md:mb-0">
                {tableContent}
              </div>
            )}
          </>
        )}
      </>
    );
  }

  function renderPlanetsAndHouses(): JSX.Element {
    const planetsContent =
      !nextChartContentLoaded ?
        <div className="w-full h-full flex flex-col">
          <SkeletonLine width="w-1/3" className="mb-4" />
          <SkeletonTable rows={10} cols={isScreen1366() ? 2 : 3}
            colsWidthArray={isScreen1366() ? ["w-24", "w-36"] : undefined}
          />
        </div>
        :
        <div className="w-full">
          <h2 className="font-bold self-start text-lg mb-2 mt-[-5px] flex flex-row items-center gap-1">
            {t("birthChart.planets")}:
            <span className="w-fit flex flex-row items-center justify-start gap-1">
              {showSwitchPartsButton() && (
                <>
                  <button
                    title="Alterar entre partes internas e externas"
                    className="rounded-sm hover:outline-2 outline-offset-4 hover:cursor-pointer active:bg-gray-300"
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
                  {!useInnerPlanets && `(${t("aspects.outerInitial")})`}
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
                    className="w-full flex flex-row items-center justify-between xl:gap-2 2xl:gap-0"
                  >
                    <div
                      className={`w-[5.5rem] md:w-[6rem] ${planetsAntiscion[planet.type] ? "antiscion" : ""
                        }`}
                    >
                      {t(`planets.${planet.type}`)}
                    </div>

                    <div className="w-[1.5rem] flex flex-row items-center">
                      {getPlanetImage(planet.type, {
                        isRetrograde: planet.isRetrograde,
                        isTransit: planet.isTransit,
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
                      :
                    </div>

                    <div className="w-[4rem] md:w-[4.5rem] xl:w-[4.5rem] 2xl:w-[4.5rem] text-end flex flex-row items-center justify-end">
                      {formatSignColor(
                        planetsAntiscion[planet.type]
                          ? chartForPlanets.planetsWithSigns[index].antiscion
                          : chartForPlanets.planetsWithSigns[index].position
                      )}
                    </div>

                    <button
                      title={`${planetsAntiscion[planet.type] ? "Normal" : "Antiscion"}`}
                      className={`rounded-sm w-[2rem] hidden xl:flex xl:flex-row xl:items-center xl:justify-center 3xl:hidden hover:outline-2 hover:bg-gray-200 active:bg-gray-400 
                      ${planetsAntiscion[planet.type] ? "antiscion" : ""}`}
                      onClick={() => {
                        togglePlanetAntiscion(planet.type);
                      }}
                    >
                      ▶
                    </button>

                    <div className="w-[10rem] pl-3 md:pl-0 md:w-[11rem] flex flex-row items-center xl:hidden 3xl:flex">
                      Antiscion:
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
        </div>

    const housesContent =
      !nextChartContentLoaded ?
        <div className="w-full h-full flex flex-col">
          <SkeletonLine width="w-1/3" className="mb-4" />
          <SkeletonTable rows={11} cols={isScreen1366() ? 2 : 3}
            colsWidthArray={isScreen1366() ? ["w-24", "w-36"] : undefined}
          />
        </div>
        :
        <div className="w-full">
          <h2 className="font-bold self-start text-lg mb-2 flex flex-row items-center gap-1">
            {t("birthChart.houses")}:
            <span className="w-fit flex flex-row items-center justify-start gap-1">
              {showSwitchPartsButton() && (
                <>
                  <button
                    title="Alterar entre partes internas e externas"
                    className="rounded-sm hover:outline-2 outline-offset-4 hover:cursor-pointer active:bg-gray-300"
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
                  {!useInnerHouses && `(${t("aspects.outerInitial")})`}
                </>
              )}
            </span>
          </h2>
          {chartForHouses && (
            <ul className="w-full mb-4 text-[0.85rem] md:text-[1rem]">
              {chartForHouses.housesData.housesWithSigns?.map((house, index) => (
                <li
                  key={index}
                  className="w-full flex flex-row items-center justify-between xl:gap-2 2xl:gap-0"
                >
                  <div
                    className={`w-[6.5rem] md:w-[8rem] flex flex-row text-nowrap 
                        ${!isMobileBreakPoint()
                        ? ""
                        : index % 3 === 0
                          ? ""
                          : ""
                      } ${housesAntiscion[`Casa ${index + 1}`] ? "antiscion" : ""
                      } ${index % 3 === 0 ? "font-bold" : ""}`}
                  >
                    {t("birthChart.house")} {index + 1}
                    {index % 3 === 0 ? ` (${getHouseLabel(index)})` : ""}:
                  </div>

                  <div className="w-[4rem] md:w-[5rem] flex flex-row items-center justify-end">
                    {!housesAntiscion[`Casa ${index + 1}`]
                      ? formatSignColor(house)
                      : getHouseAntiscion(chartForHouses.housesData.house[index])}
                  </div>

                  <button
                    title={`${housesAntiscion[`Casa ${index + 1}`] ? "Normal" : "Antiscion"}`}
                    className={`rounded-sm w-[2rem] hidden xl:flex xl:flex-row xl:items-center xl:justify-center 3xl:hidden hover:outline-2 hover:bg-gray-200 active:bg-gray-400 
                      ${housesAntiscion[`Casa ${index + 1}`] ? "antiscion" : ""
                      }`}
                    onClick={() => {
                      toggleHouseAntiscion(`Casa ${index + 1}`);
                    }}
                  >
                    ▶
                  </button>

                  <div className="w-[9rem] md:w-[11rem] flex flex-row items-center xl:hidden 3xl:flex">
                    Antiscion:
                    <span className="w-full text-end">
                      {getHouseAntiscion(chartForHouses.housesData.house[index])}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

    return (
      <div className="w-full flex flex-col justify-start gap-2 md:gap-5">
        {!isMobileBreakPoint() && (
          <>
            <Container className="xl:w-full 2xl:w-[18.5rem] 3xl:w-29rem px-6! 2xl:ml-[-15px] 3xl:ml-zero">
              {planetsContent}
            </Container>
            <Container className="xl:w-full 2xl:w-[18.5rem] 3xl:w-29rem px-6! 2xl:ml-[-15px] 3xl:ml-zero">
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
    if(!result) result = chartDateProps.birthChart?.transits !== undefined;

    return result;
  }

  function toggleInnerPlanetsVisualization() {
    setUseInnerPlanets((prev) => !prev);
  }

  function toggleInnerHousesVisualization() {
    setUseInnerHouses((prev) => !prev);
  }

  return (
    <div className="w-[95%] md:w-full flex flex-col md:flex-row md:items-start md:justify-center mt-1 mb:mb-4">
      {isMobileBreakPoint() && (
        <>
          {renderChart()}

          {chartIsLocked ? (
            <div className="w-full overflow-y-auto overscroll-contain" style={{ maxHeight: "calc(100vh - 24rem)" }}>
              {renderPlanetsAndHouses()}
              {renderArabicPartsAndAspectsTable()}
            </div>
          ) : (
            <>
              {renderPlanetsAndHouses()}
              {renderArabicPartsAndAspectsTable()}
            </>
          )}
        </>
      )}

      {!isMobileBreakPoint() && (
        <div className="w-full flex flex-row items-start justify-center mb-4">
          {renderArabicPartsAndAspectsTable()}
          {renderChart()}
          <div className="w-auto">
            {renderPlanetsAndHouses()}
          </div>
        </div>
      )}
    </div>
  );
}