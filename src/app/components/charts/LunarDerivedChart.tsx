import React, { useEffect, useState } from "react";
import {
  arabicPartKeys,
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  getReturnDateRangeString,
} from "../../utils/chartUtils";
import { ChartDate } from ".././ChartDate";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import { useBirthChart } from "@/contexts/BirthChartContext";
import ChartSelectorArrows from "../ChartSelectorArrows";

// const getGlyphOnly = true;

export default function LunarDerivedChart() {
  const [returnTime, setReturnTime] = useState("");
  const [parts, setParts] = useState<ArabicPartsType>({});
  const [renderChart, setRenderChart] = useState(false);
  const [combineWithBirthChart, setCombineWithBirthChart] = useState(false);
  const [combineWithReturnChart, setCombineWithReturnChart] = useState(false);
  const { arabicParts } = useArabicParts();
  const { calculateBirthArchArabicPart } = useArabicPartCalculations();
  const lots: ArabicPartsType = {};
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );
  const { birthChart, returnChart, lunarDerivedChart } = useBirthChart();

  const setArabicParts = () => {
    if (arabicParts === undefined) return;

    arabicPartKeys.forEach((key) => {
      const part = arabicParts[key];

      if (part && lunarDerivedChart) {
        const newArchArabicPart = calculateBirthArchArabicPart(
          part,
          lunarDerivedChart.housesData.ascendant
        );
        lots[key] = newArchArabicPart;
        const updatedParts: ArabicPartsType = { ...parts, ...lots };
        setParts(updatedParts);
      }
    });
    setRenderChart(true);
  };

  useEffect(() => {
    if (lunarDerivedChart) {
      setArabicParts();
      if (lunarDerivedChart.returnTime) {
        setReturnTime(lunarDerivedChart.returnTime);
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
          <ChartDate chartType="return" customReturnTime={returnTime} />
          {!combineWithBirthChart && !combineWithReturnChart && (
            <ChartAndData
              innerChart={lunarDerivedChart}
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
              outerArabicParts={parts}
              combineWithBirthChart={toggleShowBirthCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            />
          )}

          {combineWithReturnChart && birthChart && returnChart && (
            <ChartAndData
              innerChart={returnChart}
              outerChart={lunarDerivedChart}
              outerArabicParts={parts}
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
