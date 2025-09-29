import React, { useEffect, useState } from "react";
import {
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  getReturnDateRangeString,
} from "@/utils/chartUtils";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import { useBirthChart } from "@/contexts/BirthChartContext";

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

  function getTitle() {
    return `Mapa do Retorno Lunar Derivado para 
              ${getReturnDateRangeString(
                lunarDerivedChart?.returnTime ?? "0000-00-00 00:00:00",
                "lunar"
              )}`;
  }

  return (
    <div className="w-full flex flex-col items-center justify-between">
      {lunarDerivedChart && renderChart && (
        <>
          {!combineWithBirthChart && !combineWithReturnChart && (
            <ChartAndData
              innerChart={lunarDerivedChart}
              arabicParts={lunarDerivedParts}
              combineWithBirthChart={toggleShowBirthCombinedchart}
              combineWithReturnChart={toggleShowReturnCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              chartDateProps={{
                chartType: "return",
                birthChart: lunarDerivedChart,
                customReturnTime: returnTime,
                label: "Retorno",
              }}
              title={getTitle()}
            />
          )}

          {combineWithBirthChart && birthChart && (
            <ChartAndData
              innerChart={birthChart}
              outerChart={lunarDerivedChart}
              arabicParts={arabicParts}
              outerArabicParts={lunarDerivedParts}
              combineWithBirthChart={toggleShowBirthCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              chartDateProps={{
                chartType: "return",
                birthChart: lunarDerivedChart,
                customReturnTime: returnTime,
                label: "Retorno",
              }}
              title={getTitle()}
            />
          )}

          {combineWithReturnChart && birthChart && returnChart && (
            <ChartAndData
              innerChart={returnChart}
              outerChart={lunarDerivedChart}
              arabicParts={solarReturnParts}
              outerArabicParts={lunarDerivedParts}
              combineWithReturnChart={toggleShowReturnCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              chartDateProps={{
                chartType: "return",
                birthChart: lunarDerivedChart,
                customReturnTime: returnTime,
                label: "Retorno",
              }}
              title={getTitle()}
            />
          )}
        </>
      )}
    </div>
  );
}
