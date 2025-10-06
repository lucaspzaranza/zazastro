import { useBirthChart } from "@/contexts/BirthChartContext";
import { useEffect, useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import {
  getReturnDateRangeString,
} from "@/utils/chartUtils";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";

export default function ReturnChart() {
  const { profileName } = useBirthChart();
  const { birthChart, returnChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const [isSolarReturn, setIsSolarReturn] = useState(true);
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );

  useEffect(() => {
    setIsSolarReturn(returnChart?.returnType === "solar");
  }, [returnChart]);

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  if (returnChart === undefined) return;

  function getTitle() {
    return `Retorno ${isSolarReturn ? "Solar" : "Lunar"} para 
            ${getReturnDateRangeString(
      returnChart?.returnTime ?? "0000-00-00 00:00:00",
      isSolarReturn ? "solar" : "lunar"
    )} - ${profileName}`;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 mb-4">
      {returnChart && returnChart.timezone && (
        <div className="w-full text-left flex flex-col items-center">
          {!isCombinedWithBirthChart && returnChart && (
            <ChartAndData
              innerChart={returnChart}
              arabicParts={archArabicParts}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              chartDateProps={{
                chartType: "return",
                birthChart: returnChart,
                label: "Retorno",
              }}
              title={getTitle()}
            />
          )}

          {isCombinedWithBirthChart && birthChart && (
            <ChartAndData
              innerChart={birthChart}
              outerChart={returnChart}
              arabicParts={arabicParts}
              outerArabicParts={archArabicParts}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              chartDateProps={{
                chartType: "return",
                birthChart: returnChart,
                label: "Retorno",
              }}
              title={getTitle()}
            />
          )}
        </div>
      )}
    </div>
  );
}
