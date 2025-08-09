import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { useEffect, useState } from "react";
import { ChartDate } from "./ChartDate";
import AstroChart from "./AstroChart";
import BirthArchArabicParts from "./BirthArchArabicParts";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import LunarDerivedChart from "./LunarDerivedChart";
import ChartAndData from "./ChartAndData";

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length > 0) {
      const value = Number.parseFloat(e.target.value);
      setInput(value);

      if (value < 0) {
        setInput(0);
      } else if (value >= 360) {
        setInput(359.59);
      }
    } else {
      setInput(0);
    }
  }

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

  if (returnChart === undefined) return;

  return (
    <div className="mt-4 flex flex-col gap-3">
      <h1 className="font-bold text-lg text-center">
        Mapa do Retorno {isSolarReturn ? "Solar" : "Lunar"} para&nbsp;
        {isSolarReturn
          ? `${targetDate.year}/${targetDate.year ? targetDate.year + 1 : ""}`
          : `${returnChart.targetDate?.month.toString().padStart(2, "0")}/${
              returnChart.targetDate?.year
            }`}
      </h1>

      {returnChart && (
        <div className="w-full text-left flex flex-col">
          <ChartDate chartType="return" />

          {!combineWithBirthChart && returnChart && (
            <ChartAndData birthChart={returnChart} useArchArabicParts>
              <AstroChart
                planets={returnChart.planets}
                housesData={returnChart.housesData}
                arabicParts={archArabicParts}
                combineWithBirthChart={toggleShowCombinedchart}
              />
            </ChartAndData>
          )}

          {combineWithBirthChart && birthChart && (
            <ChartAndData birthChart={returnChart} useArchArabicParts>
              <AstroChart
                planets={birthChart.planets}
                housesData={birthChart.housesData}
                arabicParts={arabicParts}
                outerPlanets={returnChart.planets}
                outerHouses={returnChart.housesData}
                outerArabicParts={archArabicParts}
                combineWithBirthChart={toggleShowCombinedchart}
              />
            </ChartAndData>
          )}

          {isSolarReturn && birthChart && returnChart && (
            <LunarDerivedChart
              birthChart={birthChart}
              solarReturnChart={returnChart}
            />
          )}
        </div>
      )}
    </div>
  );
}
