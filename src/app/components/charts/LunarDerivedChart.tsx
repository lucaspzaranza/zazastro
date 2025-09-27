import React, { useEffect, useState } from "react";
import {
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  getReturnDateRangeString,
} from "@/utils/chartUtils";
import { ChartDate } from ".././ChartDate";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import { useBirthChart } from "@/contexts/BirthChartContext";
import ChartSelectorArrows from "../ChartSelectorArrows";

export default function LunarDerivedChart() {
  const [returnTime, setReturnTime] = useState("");
  const [renderChart, setRenderChart] = useState(false);
  const [combineWithBirthChart, setCombineWithBirthChart] = useState(false);
  const [combineWithReturnChart, setCombineWithReturnChart] = useState(false);
  const { arabicParts, lunarDerivedParts, solarReturnParts } = useArabicParts();
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );
  const { birthChart, returnChart, lunarDerivedChart } = useBirthChart();

  useEffect(() => {
    if (lunarDerivedChart) {
      if (lunarDerivedChart.returnTime) {
        setReturnTime(lunarDerivedChart.returnTime);
        setRenderChart(true);
      }
    }
  }, [lunarDerivedChart]);

  const toggleShowBirthCombinedchart = () => {
    if (combineWithReturnChart) setCombineWithReturnChart(false);
    setCombineWithBirthChart((prev) => !prev);
  };

  const toggleShowReturnCombinedchart = () => {
    if (combineWithBirthChart) setCombineWithBirthChart(false);
    setCombineWithReturnChart((prev) => !prev);
  };

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  return (
    <div className="w-full flex flex-col items-center justify-between">
      {lunarDerivedChart && renderChart && (
        <>
          <ChartSelectorArrows className="w-full md:w-[60%] mb-2">
            <h1 className="text-lg md:text-2xl font-bold text-center">
              Mapa do Retorno Lunar Derivado para&nbsp;
              {getReturnDateRangeString(
                lunarDerivedChart.returnTime ?? "0000-00-00 00:00:00",
                "lunar"
              )}
            </h1>
          </ChartSelectorArrows>
          <ChartDate
            chartType="return"
            customReturnTime={returnTime}
            birthChart={lunarDerivedChart}
          />
          {!combineWithBirthChart && !combineWithReturnChart && (
            <ChartAndData
              innerChart={lunarDerivedChart}
              arabicParts={lunarDerivedParts}
              useArchArabicPartsForDataVisualization
              combineWithBirthChart={toggleShowBirthCombinedchart}
              combineWithReturnChart={toggleShowReturnCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            />
          )}

          {combineWithBirthChart && birthChart && (
            <ChartAndData
              innerChart={birthChart}
              outerChart={lunarDerivedChart}
              useArchArabicPartsForDataVisualization
              arabicParts={arabicParts}
              outerArabicParts={lunarDerivedParts}
              combineWithBirthChart={toggleShowBirthCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            />
          )}

          {combineWithReturnChart && birthChart && returnChart && (
            <ChartAndData
              innerChart={returnChart}
              outerChart={lunarDerivedChart}
              arabicParts={solarReturnParts}
              outerArabicParts={lunarDerivedParts}
              useArchArabicPartsForDataVisualization
              combineWithReturnChart={toggleShowReturnCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            />
          )}
        </>
      )}
    </div>
  );
}
