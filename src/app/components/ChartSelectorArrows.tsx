import { useChartMenu } from "@/contexts/ChartMenuContext";
import React, { Children, useEffect, useState } from "react";

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

  useEffect(() => {}, [allChartMenus]);

  return (
    <div className={"flex flex-row items-center justify-between " + className}>
      <button
        disabled={isFirstChart()}
        onClick={previousChartMenu}
        className="w-[2rem] h-[2rem] hover:outline-2 text-xl active:bg-gray-200 disabled:opacity-50"
      >
        ◀
      </button>
      {children}
      <button
        disabled={isLastChart()}
        onClick={nextChartMenu}
        className="w-[2rem] h-[2rem] hover:outline-2 text-xl active:bg-gray-200 disabled:opacity-50"
      >
        ▶
      </button>
    </div>
  );
}
