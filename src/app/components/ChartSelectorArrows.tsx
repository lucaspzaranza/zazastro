import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import React, { useEffect } from "react";

interface ChartSelectorProps {
  children: React.ReactNode;
  className?: string;
}

export default function ChartSelectorArrows(props: ChartSelectorProps) {
  const { children, className } = props;
  const {
    allChartMenus,
    isFirstChart,
    isLastChart,
    nextChartMenu,
    previousChartMenu,
  } = useChartMenu();

  const { updateIsCombinedWithBirthChart, updateIsCombinedWithReturnChart } =
    useBirthChart();

  useEffect(() => {}, [allChartMenus]);

  const previous = () => {
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);
    previousChartMenu();
  };

  const next = () => {
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);
    nextChartMenu();
  };

  return (
    <div className={"flex flex-row items-center justify-between " + className}>
      <button
        disabled={isFirstChart()}
        onClick={previous}
        className="w-[2rem] h-[2rem] hover:outline-2 text-xl active:bg-gray-200 disabled:opacity-50"
        title="Menu anterior"
      >
        ◀
      </button>
      {children}
      <button
        disabled={isLastChart()}
        onClick={next}
        className="w-[2rem] h-[2rem] hover:outline-2 text-xl active:bg-gray-200 disabled:opacity-50"
        title="Próximo menu"
      >
        ▶
      </button>
    </div>
  );
}
