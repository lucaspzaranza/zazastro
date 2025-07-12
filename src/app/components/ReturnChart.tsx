import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { useEffect, useState } from "react";
import { ChartDate } from "./ChartDate";
import AstroChart from "./AstroChart";

export default function BirthArch() {
  const [input, setInput] = useState(0);
  const { returnChart } = useBirthChart();
  const [isSolarReturn, setIsSolarReturn] = useState(true);
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
      {/* <h2>Arco Natal</h2>
      <input
        className="outline-1"
        placeholder="Ex: 120.50"
        type="number"
        name="birthArch"
        value={input}
        onChange={handleChange}
        min={0}
        max={359.59}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Calcular
      </button> */}

      {returnChart && (
        <div className="text-left">
          <ChartDate chartType="return" />
          <AstroChart
            planets={returnChart.planets}
            housesData={returnChart.housesData}
          />

          <h2 className="font-bold text-lg mb-2">Casas Astrológicas:</h2>
          <ul className="mb-4">
            {returnChart.housesData.housesWithSigns?.map((house, index) => (
              <li key={house}>
                Casa {index + 1}: {house}
              </li>
            ))}
          </ul>

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
      )}
    </div>
  );
}
