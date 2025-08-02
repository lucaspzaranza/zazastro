import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { useEffect, useState } from "react";
import { ChartDate } from "./ChartDate";
import AstroChart from "./AstroChart";
import BirthArchArabicParts from "./BirthArchArabicParts";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import LunarDerivedChart from "./LunarDerivedChart";

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
      <h1 className="font-bold text-lg mb-2">
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

          {!combineWithBirthChart && (
            <AstroChart
              planets={returnChart.planets}
              housesData={returnChart.housesData}
              arabicParts={archArabicParts}
              combineWithBirthChart={toggleShowCombinedchart}
            />
          )}

          {combineWithBirthChart && birthChart && (
            <AstroChart
              planets={birthChart.planets}
              housesData={birthChart.housesData}
              arabicParts={arabicParts}
              outerPlanets={returnChart.planets}
              outerHouses={returnChart.housesData}
              outerArabicParts={archArabicParts}
              combineWithBirthChart={toggleShowCombinedchart}
            />
          )}

          <div className="flex flex-row justify-between mt-8">
            <div>
              <h2 className="font-bold text-lg mb-2">Casas:</h2>
              <ul className="mb-4">
                {returnChart.housesData.housesWithSigns?.map((house, index) => (
                  <li key={house}>
                    Casa {index + 1}: {house}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-2">Planetas:</h2>
              <ul>
                {returnChart.planets?.map((planet, index) => (
                  <li key={planet.name}>
                    {returnChart.planetsWithSigns !== undefined && (
                      <>
                        {planet.name}:{" "}
                        {returnChart.planetsWithSigns[index].position}
                        &nbsp;Antiscion:{" "}
                        {returnChart.planetsWithSigns[index].antiscion}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <BirthArchArabicParts useCustomASCControls />

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
