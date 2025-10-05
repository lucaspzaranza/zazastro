import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import { BirthDate, ReturnChartType } from "@/interfaces/BirthChartInterfaces";
import React, { useEffect } from "react";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { apiFetch } from "../utils/api";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { makeLunarDerivedChart } from "../utils/chartUtils";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";

interface ChartSelectorProps {
  children: React.ReactNode;
}

type DirectionType = "previous" | "next";

export default function ReturnSelectorArrows(props: ChartSelectorProps) {
  const { children } = props;

  const { profileName, birthChart, returnChart, lunarDerivedChart, progressionChart, updateBirthChart,
    isCombinedWithBirthChart, isCombinedWithReturnChart,
    updateLunarDerivedChart, updateIsCombinedWithBirthChart, updateIsCombinedWithReturnChart } = useBirthChart();
  const { isMobileBreakPoint } = useScreenDimensions();
  const { chartMenu } = useChartMenu();
  const { archArabicParts, updateSolarReturnParts } = useArabicParts();

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

  const getChart = (direction: DirectionType) => {
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);

    if (chartMenu === "lunarReturn" || chartMenu === "solarReturn")
      getReturn(returnChart?.returnType || "solar", direction);
    else if (chartMenu === "lunarDerivedReturn") getLunarDerivedReturn(direction);
    else if (chartMenu === "progression") getProgression(direction);
  }

  const getMobileTopValue = () => {
    if (isMobileBreakPoint()) {
      if (isCombinedWithBirthChart || isCombinedWithReturnChart) return "top-[19rem]";
      else return "top-[19rem]";
    } else return ""
  }

  return (
    <div className="relative w-full h-full flex flex-row items-center justify-between">
      <button
        onClick={() => getChart("previous")}
        className={`absolute ${getMobileTopValue()} md:top-auto outline-2 md:outline-0 left-1 
          w-[5rem] md:w-[2rem] h-[2rem] mb-3 mr-2 flex flex-row items-center justify-center md:justify-start 
          text-xl hover:outline-2 active:bg-gray-300 rounded-md`}
        title="Retorno anterior"
      >
        <MdKeyboardDoubleArrowLeft size={30} />
      </button>

      <div className="w-full flex flex-row items-center justify-center">
        {children}
      </div>

      <button
        onClick={() => getChart("next")}
        className={`absolute ${getMobileTopValue()} md:top-auto outline-2 md:outline-0 right-1
          w-[5rem] md:w-[2rem] h-[2rem] mb-3 ml-2 flex flex-row items-center justify-center md:justify-end 
          text-xl hover:outline-2 active:bg-gray-300 rounded-md`}
        title="Próximo retorno"
      >
        <MdKeyboardDoubleArrowRight size={30} />
      </button>
    </div>
  );
}
