import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import { BirthDate, ReturnChartType } from "@/interfaces/BirthChartInterfaces";
import React, { useEffect } from "react";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { apiFetch } from "../utils/api";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { getProfectionChart, makeLunarDerivedChart } from "../utils/chartUtils";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import { useAspectsData } from "@/contexts/AspectsContext";

interface ChartSelectorProps {
  children: React.ReactNode;
}

type DirectionType = "previous" | "next";

export default function ReturnSelectorArrows(props: ChartSelectorProps) {
  const { children } = props;

  const { profileName, birthChart, returnChart, lunarDerivedChart, progressionChart, profectionChart, updateBirthChart,
    isCombinedWithBirthChart, isCombinedWithReturnChart,
    updateLunarDerivedChart, updateIsCombinedWithBirthChart, updateIsCombinedWithReturnChart,
    updateLoadingNextChart } = useBirthChart();
  const { isMobileBreakPoint } = useScreenDimensions();
  const { chartMenu } = useChartMenu();
  const { archArabicParts, updateSolarReturnParts } = useArabicParts();
  const { hasIsolatedAspect } = useAspectsData();

  const arrowButtonClass = `w-[2rem] h-[2rem] mx-4 flex flex-row items-center justify-center
    text-xl hover:outline-2 active:bg-gray-300 rounded-md
    disabled:opacity-50 disabled:hover:outline-0 disabled:active:bg-transparent`;

  const mobileArrowButtonClass = `bg-zinc-50 w-[5rem] h-[2rem] flex flex-row items-center justify-center
    text-xl outline-2 active:bg-gray-300 rounded-md
    disabled:opacity-50 disabled:hover:outline-0 disabled:active:bg-transparent`;

  useEffect(() => {
    if (chartMenu === "lunarDerivedReturn")
      updateSolarReturnParts(archArabicParts);
  }, [archArabicParts])

  async function getReturn(returnType: ReturnChartType, direction: DirectionType) {
    if (!returnChart) return;

    let targetDate: BirthDate = {
      ...returnChart.targetDate!,
    };
    const jsDate = new Date(targetDate.year, targetDate.month - 1, targetDate.day);

    if (returnType === "solar") {
      jsDate.setFullYear(direction === "previous" ? jsDate.getFullYear() - 1 : jsDate.getFullYear() + 1);
    } else if (returnType === "lunar") {
      jsDate.setDate(direction === "previous" ? jsDate.getDate() - 27 : jsDate.getDate() + 27);
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
    jsDate.setDate(direction === "previous" ? jsDate.getDate() - 27 : jsDate.getDate() + 27);

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

      setTimeout(() => {
        updateLoadingNextChart(false);
      }, 200);
    }, 100);
  }

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
      {/* Seta esquerda: só no desktop, ao lado do conteúdo */}
      <button
        disabled={hasIsolatedAspect}
        onClick={() => getChart("previous")}
        className={`hidden md:flex ${arrowButtonClass}`}
        title="Retorno anterior"
      >
        <MdKeyboardDoubleArrowLeft size={30} />
      </button>

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

      {/* Setas mobile: linha própria, abaixo do conteúdo */}
      <div className="w-full md:hidden flex flex-row items-center justify-between gap-4">
        <button
          disabled={hasIsolatedAspect}
          onClick={() => getChart("previous")}
          className={mobileArrowButtonClass}
          title="Retorno anterior"
        >
          <MdKeyboardDoubleArrowLeft size={30} />
        </button>
        <button
          disabled={hasIsolatedAspect}
          onClick={() => getChart("next")}
          className={mobileArrowButtonClass}
          title="Próximo retorno"
        >
          <MdKeyboardDoubleArrowRight size={30} />
        </button>
      </div>
    </div>
  );
}