import {
  BirthChart,
  BirthDate,
  Planet,
  planetTypes,
} from "@/interfaces/BirthChartInterfaces";
import React, { useEffect, useState } from "react";
import {
  arabicPartKeys,
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  convertDegMinToDecimal,
  decimalToDegreesMinutes,
  getAntiscion,
  getDegreeAndSign,
  monthsNames,
} from "../../utils/chartUtils";
import AstroChart from "./AstroChart";
import moment from "moment";
import { ChartDate } from ".././ChartDate";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import BirthArchArabicParts from ".././BirthArchArabicParts";
import ChartAndData from ".././ChartAndData";

interface Props {
  birthChart: BirthChart;
  solarReturnChart: BirthChart;
}

const getGlyphOnly = true;

const LunarDerivedChart: React.FC<Props> = ({
  birthChart,
  solarReturnChart,
}) => {
  const [lunarChart, setLunarChart] = useState<BirthChart | undefined>();
  const [returnTime, setReturnTime] = useState("");
  const [parts, setParts] = useState<ArabicPartsType>({});
  const [renderChart, setRenderChart] = useState(false);
  const [combineWithBirthChart, setCombineWithBirthChart] = useState(false);
  const [combineWithReturnChart, setCombineWithReturnChart] = useState(false);
  const { arabicParts, archArabicParts } = useArabicParts();
  const { calculateBirthArchArabicPart } = useArabicPartCalculations();
  const lots: ArabicPartsType = {};
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );

  const setArabicParts = () => {
    if (arabicParts === undefined) return;

    arabicPartKeys.forEach((key) => {
      const part = arabicParts[key];

      if (part && lunarChart) {
        const newArchArabicPart = calculateBirthArchArabicPart(
          part,
          lunarChart.housesData.ascendant
        );
        lots[key] = newArchArabicPart;
        const updatedParts: ArabicPartsType = { ...parts, ...lots };
        setParts(updatedParts);
      }
    });
    setRenderChart(true);
  };

  useEffect(() => {
    if (lunarChart) {
      setArabicParts();
      if (lunarChart.returnTime) setReturnTime(lunarChart.returnTime);
    }
  }, [lunarChart]);

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
      {lunarChart && renderChart && (
        <div>
          <ChartDate chartType="return" customReturnTime={returnTime} />
          {!combineWithBirthChart && !combineWithReturnChart && (
            <ChartAndData
              birthChart={lunarChart}
              useArchArabicPartsForDataVisualization
              arabicParts={parts}
              customPartsForDataVisualization={parts}
              combineWithBirthChart={toggleShowBirthCombinedchart}
              combineWithReturnChart={toggleShowReturnCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              isSolarReturn={false}
            />
          )}

          {combineWithBirthChart && birthChart && (
            <ChartAndData
              birthChart={birthChart}
              outerChart={lunarChart}
              useArchArabicPartsForDataVisualization
              arabicParts={arabicParts}
              customPartsForDataVisualization={parts}
              outerArabicParts={parts}
              combineWithBirthChart={toggleShowBirthCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              isSolarReturn={false}
            />
          )}

          {combineWithReturnChart && birthChart && (
            <ChartAndData
              birthChart={solarReturnChart}
              outerChart={lunarChart}
              arabicParts={archArabicParts}
              outerArabicParts={parts}
              useArchArabicPartsForDataVisualization
              customPartsForDataVisualization={parts}
              combineWithReturnChart={toggleShowReturnCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              isSolarReturn={false}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LunarDerivedChart;
