import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { useEffect, useState } from "react";
import { ChartDate } from ".././ChartDate";
import AstroChart from "./AstroChart";
import BirthArchArabicParts from ".././BirthArchArabicParts";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import LunarDerivedChart from "./LunarDerivedChart";
import ChartAndData from ".././ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "../../utils/chartUtils";
import ChartSelectorArrows from "../ChartSelectorArrows";

export default function BirthArch() {
  const [input, setInput] = useState(0);
  const [day, setDay] = useState(0);
  const [month, setMonth] = useState(0);
  const { birthChart, returnChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const [isSolarReturn, setIsSolarReturn] = useState(true);
  const [combineWithBirthChart, setCombineWithBirthChart] = useState(false);
  const [targetDate, setTargetDate] = useState<BirthDate>({
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
      <ChartSelectorArrows className="w-[50%]">
        <h1 className="text-2xl font-bold text-center">
          Mapa do Retorno {isSolarReturn ? "Solar" : "Lunar"} para&nbsp;
          {isSolarReturn
            ? `${targetDate.year}/${targetDate.year ? targetDate.year + 1 : ""}`
            : `${returnChart.targetDate?.month.toString().padStart(2, "0")}/${
                returnChart.targetDate?.year
              }`}
        </h1>
      </ChartSelectorArrows>

      {returnChart && (
        <div className="w-full text-left flex flex-col">
          <ChartDate chartType="return" />

          {!combineWithBirthChart && returnChart && (
            <ChartAndData
              birthChart={returnChart}
              arabicParts={archArabicParts!}
              combineWithBirthChart={toggleShowCombinedchart}
              useArchArabicPartsForDataVisualization
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              isSolarReturn={isSolarReturn}
            />
          )}

          {combineWithBirthChart && birthChart && (
            <ChartAndData
              birthChart={birthChart}
              outerChart={returnChart}
              arabicParts={arabicParts!}
              outerArabicParts={archArabicParts}
              useArchArabicPartsForDataVisualization
              combineWithBirthChart={toggleShowCombinedchart}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
              isSolarReturn={isSolarReturn}
            />
          )}

          {/* {isSolarReturn && birthChart && returnChart && (
            <div className="block pt-10 z-10">
              <LunarDerivedChart
                birthChart={birthChart}
                solarReturnChart={returnChart}
              />
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}
