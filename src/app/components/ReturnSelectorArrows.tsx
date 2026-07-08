import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import { BirthDate, ReturnChartType } from "@/interfaces/BirthChartInterfaces";
import React, { useEffect, useRef, useState } from "react";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { apiFetch } from "../utils/api";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { applyDateStep, getProfectionChart, makeLunarDerivedChart, toDate } from "../utils/chartUtils";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import { useAspectsData } from "@/contexts/AspectsContext";
import { useProfiles } from "@/contexts/ProfilesContext";
import AdvanceChartModal from "./modals/AdvanceChartModal";
import { AdvanceChartUnitType } from "@/interfaces/AstroChartInterfaces";
import { useTranslations } from "next-intl";
import { AdvanceChartInputsMobile } from "./modals/AdvanceChartInputsMobile";

interface ChartSelectorProps {
  children: React.ReactNode;
  showAdvanceOptions: boolean;
}

type DirectionType = "previous" | "next";

export default function ReturnSelectorArrows(props: ChartSelectorProps) {
  const { children, showAdvanceOptions } = props;

  const { profileName, birthChart, returnChart, lunarDerivedChart, progressionChart, 
    profectionChart, updateBirthChart, updateLunarDerivedChart, 
    updateIsCombinedWithBirthChart, updateIsCombinedWithReturnChart,
    updateLoadingNextChart, } = useBirthChart();
  const { isMobileBreakPoint } = useScreenDimensions();
  const { chartMenu, isTransitsChart, removeChartMenu, getLastChartMenu } = useChartMenu();
  const { archArabicParts, updateSolarReturnParts } = useArabicParts();
  const { hasIsolatedAspect } = useAspectsData();
  const { currentProfile } = useProfiles();

  const t = useTranslations();

  const [stepData, setStepData] = 
    useState<{value: number, unit: AdvanceChartUnitType}>({value: 1, unit: "minutes"});
  const [desktopContextMenuOpen, setDesktopContextMenuOpen] = useState(false);

  const arrowButtonClass = `w-[2rem] h-[2rem] mx-5 flex flex-row items-center justify-center
    text-xl hover:outline-2 active:bg-gray-300 rounded-md
    disabled:opacity-50 disabled:hover:outline-0 disabled:active:bg-transparent`;

  const mobileArrowButtonClass = `bg-zinc-50 w-[5rem] h-[2rem] flex flex-row items-center justify-center
    text-xl border active:bg-gray-300 rounded-md
    disabled:opacity-50 disabled:hover:outline-0 disabled:active:bg-transparent`;

  const pillBaseDesktop = `hidden md:block z-10 absolute w-18 border-zinc-400 text-zinc-700
    hover:border-zinc-500 hover:bg-zinc-100 text-[0.725rem]! p-1 rounded-full border text-[12px]
    whitespace-nowrap transition-colors disabled:opacity-50`;
  const pillLeft = `${pillBaseDesktop} left-1`
  const pillRight = `${pillBaseDesktop}`

  useEffect(() => {
    if (chartMenu === "lunarDerivedReturn")
      updateSolarReturnParts(archArabicParts);
  }, [archArabicParts]);
  
  async function getReturn(returnType: ReturnChartType, direction: DirectionType) {
    if (!returnChart) return;    

    let targetDate: BirthDate = {
      ...returnChart.targetDate!,
    };
    const jsDate = new Date(targetDate.year, targetDate.month - 1, targetDate.day);

    if (returnType === "solar") {
      jsDate.setFullYear(direction === "previous" ? jsDate.getFullYear() - 1 : jsDate.getFullYear() + 1);
    } else if (returnType === "lunar") {
      jsDate.setDate(direction === "previous" ? jsDate.getDate() - 28 : jsDate.getDate() + 28);
    }        

    targetDate = {
      ...targetDate,
      day: jsDate.getDate(),
      month: jsDate.getMonth() + 1,
      year: jsDate.getFullYear(),
    };

    try {
      const data = await apiFetch("return/" + returnType, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: returnChart?.birthDate,
          targetDate,
        }),
      });

      updateBirthChart({
        chartType: "birth",
        profileName: currentProfile?.name,
        chartData: {
          ...data,
          birthDate: currentProfile?.birthDate,
          targetDate,
        },
      });

      updateBirthChart({
        profileName,
        chartType: "return",
        chartData: {
          planets: data.returnPlanets,
          housesData: data.returnHousesData,
          returnType,
          birthDate: returnChart.birthDate,
          targetDate,
          returnTime: data.returnTime,
          fixedStars: data.fixedStars,
          timezone: data.timezone,
        },
      });

      if(chartMenu === "solarReturn" && getLastChartMenu() === "lunarDerivedReturn") {
        removeChartMenu("lunarDerivedReturn");
        updateLunarDerivedChart(undefined);
      }
      
    } catch (error) {
      console.error("Erro ao consultar mapa de retorno:", error);
    }
  }

  async function getLunarDerivedReturn(direction: DirectionType) {
    if (!returnChart || !birthChart || !lunarDerivedChart) return;

    const initialDate: BirthDate = lunarDerivedChart.birthDate;
    let targetDate: BirthDate = {
      ...lunarDerivedChart.targetDate!,
    };

    const jsDate = new Date(targetDate.year, targetDate.month - 1, targetDate.day);
    jsDate.setDate(direction === "previous" ? jsDate.getDate() - 28 : jsDate.getDate() + 28);

    targetDate = {
      ...targetDate,
      day: jsDate.getDate(),
      month: jsDate.getMonth() + 1,
      year: jsDate.getFullYear(),
    };

    try {
      const data = await apiFetch("return/lunar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: lunarDerivedChart.birthDate,
          targetDate,
        }),
      });

      const newLunarDerivedChart = makeLunarDerivedChart(data, initialDate, targetDate);
      updateLunarDerivedChart?.(newLunarDerivedChart);
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    }
  }

  async function getProgression(direction: DirectionType) {
    if (!progressionChart) return;

    const birthDate: BirthDate = {
      ...progressionChart.birthDate,
      day: direction === "previous" ? progressionChart.birthDate.day - 1 : progressionChart.birthDate.day + 1,
    }

    try {
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
        }),
      });

      updateBirthChart({
        chartData: {
          ...data,
          birthDate,
        },
        chartType: "progression",
      });
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    }
  }

  function getProfection(direction: DirectionType) {
    if (!profectionChart) return;

    const profectedChart = getProfectionChart(profectionChart, direction === "previous" ? -1 : 1);

    updateBirthChart({
      chartData: {
        ...profectedChart,
      },
      chartType: "profection",
    });
  }

  async function advanceOrRewindChart(direction: DirectionType) {
    if(!birthChart) return;

    const date: BirthDate = isTransitsChart() ? birthChart.transits?.date! : birthChart.birthDate;
    const targetDate: BirthDate = applyDateStep(date, direction, stepData);
    
    try {
      const dateToSendToRequest = isTransitsChart() ? birthChart.birthDate : targetDate;
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: { 
            ...dateToSendToRequest, 
            houseSystem: targetDate.houseSystem
          },
          transitsDate: isTransitsChart() ? targetDate : undefined,
        }),
      });

      updateBirthChart({
        profileName: currentProfile?.name,
        chartData: {
          ...data,
          birthDate: isTransitsChart() ? birthChart.birthDate! : targetDate
        },
        transits: isTransitsChart() ? data.transits : undefined,
        chartType: isTransitsChart() ? "transits" : "birth",
      });
    }
    catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    }
  }

  const getChart = async (direction: DirectionType) => {
    updateLoadingNextChart(true);
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);    

    setTimeout(async () => {
      if (chartMenu === "lunarReturn" || chartMenu === "solarReturn")
        await getReturn(returnChart?.returnType || "solar", direction);
      else if (chartMenu === "lunarDerivedReturn") await getLunarDerivedReturn(direction);
      else if (chartMenu === "progression") await getProgression(direction);
      else if (chartMenu === "profection") getProfection(direction);
      else if(chartMenu === "transits" || chartMenu === "moment" || currentProfile?.gender === "event")
        advanceOrRewindChart(direction);

      setTimeout(() => {
        updateLoadingNextChart(false);
      }, 200);
    }, 100);
  }

  const getStepBtnLabel = (signal: string) => {
    const number = stepData.value;
    const unit = 
      t(`timeAdvanceModal.abbreviations.${number === 1? "single" : "multiple"}.${stepData.unit}`);
    return `${signal}${number} ${unit}`
  }

  const getTopValue = () => {
    if(chartMenu === "transits")
      return "top-[60%]";
    else if(chartMenu === "moment" || currentProfile?.gender === "event")
      return "top-[58%]";
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
      {/* DESKTOP => Seta esquerda: só no desktop, ao lado do conteúdo */}
      
      <button
        disabled={hasIsolatedAspect}
        onClick={() => getChart("previous")}
        className={`hidden md:flex ${arrowButtonClass}`}
        title="Retorno anterior"
      >
        <MdKeyboardDoubleArrowLeft size={30} />
      </button>

      {showAdvanceOptions && !isMobileBreakPoint() && 
        <div className={`md:absolute left-0 ${getTopValue()}`}>
          <button className={pillLeft} onClick={() => setDesktopContextMenuOpen(prev => !prev)}>
            {getStepBtnLabel('-')}
          </button>
        </div>
      }

      {/* Conteúdo (o container do SVG), intocado */}
      {children}

      {/* Seta direita: só no desktop, ao lado do conteúdo */}
      <button
        disabled={hasIsolatedAspect}
        onClick={() => getChart("next")}
        className={`hidden md:flex ${arrowButtonClass}`}
        title="Próximo retorno"
      >
        <MdKeyboardDoubleArrowRight size={30} />
      </button>

      {showAdvanceOptions && !isMobileBreakPoint() && 
        <div className={`md:absolute right-19 ${getTopValue()}`}>
          <button className={pillRight} onClick={() => setDesktopContextMenuOpen(prev => !prev)}>
            {getStepBtnLabel('+')}
          </button>
        </div>
      }

      {/* Setas mobile: linha própria, abaixo do conteúdo */}
      <div className="w-full md:hidden flex flex-row items-center justify-between gap-2">
        <button
          disabled={hasIsolatedAspect}
          onClick={() => getChart("previous")}
          className={mobileArrowButtonClass}
          title="Retorno anterior"
        >
          <MdKeyboardDoubleArrowLeft size={30} />
        </button>

        {showAdvanceOptions &&
          <AdvanceChartInputsMobile 
            onChange={(value, unit) => {
              // console.log('value:', value, 'unit:', unit);
              setStepData({value, unit});
            }}
          />
        }

        <button
          disabled={hasIsolatedAspect}
          onClick={() => getChart("next")}
          className={mobileArrowButtonClass}
          title="Próximo retorno"
        >
          <MdKeyboardDoubleArrowRight size={30} />
        </button>
      </div>

      {desktopContextMenuOpen && 
        <AdvanceChartModal onClose={() => {setDesktopContextMenuOpen(false)}} 
          onSubmit={(value, unit) => {setStepData({value, unit})}}
          inputValue={stepData.value}
          unitProp={stepData.unit}
        />
      }
    </div>
  );
}