import React, { useEffect, useState } from "react";
import {
  getReturnDateRangeString,
} from "@/utils/chartUtils";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";

export default function LunarDerivedChart() {
  const [returnTime, setReturnTime] = useState("");
  const [renderChart, setRenderChart] = useState(false);
  const { arabicParts, lunarDerivedParts, solarReturnParts } = useArabicParts();
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );
  const { birthChart, returnChart, lunarDerivedChart,
    isCombinedWithBirthChart, isCombinedWithReturnChart } = useBirthChart();

  useEffect(() => {
    if (lunarDerivedChart && lunarDerivedChart.returnTime) {
      setReturnTime(lunarDerivedChart.returnTime);
      setRenderChart(true);
    }
  }, [lunarDerivedChart]);

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  function getTitle() {
    return `Retorno Lunar Derivado para 
              ${getReturnDateRangeString(
      returnTime ?? "0000-00-00 00:00:00",
      "lunar"
    )}`;
  }

  const getInnerChart = (): BirthChart => {
    if (isCombinedWithBirthChart && birthChart)
      return birthChart;
    else if (isCombinedWithReturnChart && returnChart)
      return returnChart;

    return lunarDerivedChart!;
  }

  const getOuterChart = (): BirthChart | undefined => {
    if (isCombinedWithBirthChart || isCombinedWithReturnChart)
      return lunarDerivedChart;

    return undefined;
  }

  const getInnerArabicParts = (): ArabicPartsType | undefined => {
    if (isCombinedWithBirthChart)
      return arabicParts;
    else if (isCombinedWithReturnChart)
      return solarReturnParts;

    return lunarDerivedParts;
  }

  const getOuterArabicParts = (): ArabicPartsType | undefined => {
    if (isCombinedWithBirthChart || isCombinedWithReturnChart)
      return lunarDerivedParts;

    return undefined;
  }

  return (
    <div className="w-full flex flex-col items-center justify-between mb-4">
      {lunarDerivedChart && renderChart && (
        <ChartAndData
          innerChart={getInnerChart()}
          outerChart={getOuterChart()}
          arabicParts={getInnerArabicParts()}
          outerArabicParts={getOuterArabicParts()}
          tableItemsPerPage={tableItemsPerPage}
          onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
          chartDateProps={{
            chartType: "return",
            birthChart: lunarDerivedChart,
            label: "Retorno",
          }}
          title={getTitle()}
        />
      )}
    </div>
  );
}
