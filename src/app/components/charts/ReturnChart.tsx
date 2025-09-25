import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { useEffect, useState } from "react";
import { ChartDate } from ".././ChartDate";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import {
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  getReturnDateRangeString,
} from "@/utils/chartUtils";
import ChartSelectorArrows from "../ChartSelectorArrows";

export default function ReturnChart() {
  const { profileName } = useBirthChart();
  const { birthChart, returnChart } = useBirthChart();
  const { archArabicParts } = useArabicParts();
  const [isSolarReturn, setIsSolarReturn] = useState(true);
  const [combineWithBirthChart, setCombineWithBirthChart] = useState(false);
  const [, setTargetDate] = useState<BirthDate>({
    day: 0,
    month: 0,
    year: 0,
    time: "",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  });

  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );

  const toggleShowCombinedchart = () => {
    setCombineWithBirthChart((prev) => !prev);
  };

  useEffect(() => {
    setIsSolarReturn(returnChart?.returnType === "solar");
    if (returnChart?.targetDate) {
      setTargetDate({
        ...returnChart?.targetDate,
      });
    }
  }, [returnChart]);

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  if (returnChart === undefined) return;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 mb-4">
      <ChartSelectorArrows className="w-full md:w-[60%]">
        {profileName && (
          <h1 className="text-lg md:text-2xl font-bold text-center">
            Retorno {isSolarReturn ? "Solar" : "Lunar"} para&nbsp;
            {getReturnDateRangeString(
              returnChart.returnTime ?? "0000-00-00 00:00:00",
              isSolarReturn ? "solar" : "lunar"
            )}{" "}
            - {profileName}
          </h1>
        )}
      </ChartSelectorArrows>

      {returnChart && (
        <div className="w-full text-left flex flex-col items-center">
          <ChartDate chartType="return" />

          {!combineWithBirthChart && returnChart && (
            <ChartAndData
              innerChart={returnChart}
              combineWithBirthChart={toggleShowCombinedchart}
              useArchArabicPartsForDataVisualization
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            />
          )}

          {combineWithBirthChart && birthChart && (
            <ChartAndData
              innerChart={birthChart}
              outerChart={returnChart}
              outerArabicParts={archArabicParts}
              useArchArabicPartsForDataVisualization
              combineWithBirthChart={toggleShowCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            />
          )}
        </div>
      )}
    </div>
  );
}
