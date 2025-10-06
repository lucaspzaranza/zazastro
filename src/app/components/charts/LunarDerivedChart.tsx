import React, { useEffect, useState } from "react";
import {
  getReturnDateRangeString,
} from "@/utils/chartUtils";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";

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

  return (
    <div className="w-full flex flex-col items-center justify-between mb-4">
      {lunarDerivedChart && renderChart && (
        <>
          {!isCombinedWithBirthChart && !isCombinedWithReturnChart && (
            <ChartAndData
              innerChart={lunarDerivedChart}
              arabicParts={lunarDerivedParts}
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

          {isCombinedWithBirthChart && birthChart && (
            <ChartAndData
              innerChart={birthChart}
              outerChart={lunarDerivedChart}
              arabicParts={arabicParts}
              outerArabicParts={lunarDerivedParts}
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

          {isCombinedWithReturnChart && birthChart && returnChart && (
            <ChartAndData
              innerChart={returnChart}
              outerChart={lunarDerivedChart}
              arabicParts={solarReturnParts}
              outerArabicParts={lunarDerivedParts}
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
        </>
      )}
    </div>
  );
}
