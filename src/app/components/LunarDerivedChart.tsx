import {
  BirthChart,
  BirthDate,
  Planet,
  planetTypes,
} from "@/interfaces/BirthChartInterfaces";
import React, { useEffect, useState } from "react";
import {
  arabicPartKeys,
  convertDegMinToDecimal,
  decimalToDegreesMinutes,
  getAntiscion,
  getDegreeAndSign,
  monthsName,
} from "../utils/chartUtils";
import AstroChart from "./AstroChart";
import moment from "moment";
import { ChartDate } from "./ChartDate";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import BirthArchArabicParts from "./BirthArchArabicParts";
import ChartAndData from "./ChartAndData";

interface Props {
  birthChart: BirthChart;
  solarReturnChart: BirthChart;
}

const getGlyphOnly = true;

const LunarDerivedChart: React.FC<Props> = ({
  birthChart,
  solarReturnChart,
}) => {
  const [day, setDay] = useState(0);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(0);
  const [lunarChart, setLunarChart] = useState<BirthChart | undefined>();
  const [returnTime, setReturnTime] = useState("");
  const [parts, setParts] = useState<ArabicPartsType>({});
  const [renderChart, setRenderChart] = useState(false);
  const [combineWithBirthChart, setCombineWithBirthChart] = useState(false);
  const [combineWithReturnChart, setCombineWithReturnChart] = useState(false);
  const { arabicParts, archArabicParts } = useArabicParts();
  const { calculateBirthArchArabicPart } = useArabicPartCalculations();
  const lots: ArabicPartsType = {};

  const makeChart = async () => {
    const returnDate = moment.tz(birthChart.returnTime, birthChart.timezone!);
    const timeArrayString = returnDate.format("HH:mm").split(":");
    const time = [
      Number.parseInt(timeArrayString[0]),
      Number.parseInt(timeArrayString[1]),
    ];

    const birthDate: BirthDate = {
      day: returnDate.date(),
      month: returnDate.month() + 1,
      year: returnDate.year(),
      time: convertDegMinToDecimal(time[0], time[1]).toString(),
      coordinates: {
        ...birthChart.birthDate.coordinates,
      },
    };

    const targetDate: BirthDate = {
      year,
      month,
      day,
      time: birthChart.birthDate.time,
      coordinates: birthChart.birthDate.coordinates,
    };

    // console.log("birthDate: ", birthDate);
    // console.log("birthDate:", birthDate);
    // console.log("targetDate:", targetDate);

    const response = await fetch("http://localhost:3001/return/lunar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate,
        targetDate,
      }),
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(`Erro ao buscar a Revolução Lunar Derivada.`);
    }

    const data = await response.json();
    console.log(data);

    setLunarChart({
      ...data,
      returnTime: data.returnTime,
      birthDate,
      targetDate,
      planets: data.returnPlanets.map((planet: Planet) => {
        return {
          ...planet,
          longitude: decimalToDegreesMinutes(planet.longitude),
          antiscion: getAntiscion(planet.longitude),

          longitudeRaw: planet.longitude,
          antiscionRaw: getAntiscion(planet.longitude, true),
          type: planetTypes[planet.id],
        };
      }),
      planetsWithSigns: data.returnPlanets.map((planet: Planet) => {
        return {
          position: getDegreeAndSign(
            decimalToDegreesMinutes(planet.longitude),
            getGlyphOnly
          ),
          antiscion: getDegreeAndSign(
            getAntiscion(planet.longitude),
            getGlyphOnly
          ),
        };
      }),
      housesData: {
        ...data?.returnHousesData,
        housesWithSigns: data.returnHousesData?.house.map(
          (houseLong: number) => {
            return getDegreeAndSign(
              decimalToDegreesMinutes(houseLong),
              getGlyphOnly
            );
          }
        ),
      },
    });
  };

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

  // useEffect(() => {
  //   if (renderChart) {
  //     console.log(parts);
  //     console.log(lunarChart?.planets);
  //     console.log(lunarChart?.housesData);
  //   }
  // }, [renderChart]);

  const toggleShowBirthCombinedchart = () => {
    if (combineWithReturnChart) setCombineWithReturnChart(false);
    setCombineWithBirthChart((prev) => !prev);
  };

  const toggleShowReturnCombinedchart = () => {
    if (combineWithBirthChart) setCombineWithBirthChart(false);
    setCombineWithReturnChart((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center mt-2">
      <h1 className="font-bold text-lg">Retorno Lunar Derivado</h1>
      <form
        className="flex flex-row gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setRenderChart(false);
          makeChart();
        }}
      >
        <input
          type="number"
          className="border-2 w-16 p-1 rounded-sm"
          placeholder="Dia"
          onChange={(e) => {
            if (e.target.value.length > 0) {
              let val = Number.parseInt(e.target.value);
              if (val < 1) val = 1;
              if (val > 31) val = 31;
              setDay(val);
              e.target.value = val.toString();
            }
          }}
        />

        <select
          className="border-2 rounded-sm"
          onChange={(e) => setMonth(Number.parseInt(e.target.value) + 1)}
        >
          {monthsName.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="border-2 w-20 p-1 rounded-sm"
          placeholder="Ano"
          onChange={(e) => {
            if (e.target.value.length > 0) {
              let val = Number.parseInt(e.target.value);
              if (val < 0) val = 0;
              setYear(val);
              e.target.value = val.toString();
            }
          }}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            setRenderChart(false);
            makeChart();
          }}
        >
          Gerar Mapa
        </button>
      </form>

      {lunarChart && renderChart && (
        <div>
          <ChartDate chartType="return" customReturnTime={returnTime} />
          {/* <AstroChart
            planets={lunarChart.planets}
            housesData={lunarChart.housesData}
            arabicParts={parts}
          /> */}

          {!combineWithBirthChart && !combineWithReturnChart && (
            <ChartAndData
              birthChart={lunarChart}
              useArchArabicParts
              customArabicParts={parts}
            >
              <AstroChart
                planets={lunarChart.planets}
                housesData={lunarChart.housesData}
                arabicParts={parts}
                combineWithBirthChart={toggleShowBirthCombinedchart}
                combineWithReturnChart={toggleShowReturnCombinedchart}
              />
            </ChartAndData>
          )}

          {combineWithBirthChart && birthChart && (
            <ChartAndData
              birthChart={lunarChart}
              useArchArabicParts
              customArabicParts={parts}
            >
              <AstroChart
                planets={birthChart.planets}
                housesData={birthChart.housesData}
                arabicParts={arabicParts}
                outerPlanets={lunarChart.planets}
                outerHouses={lunarChart.housesData}
                outerArabicParts={parts}
                combineWithBirthChart={toggleShowBirthCombinedchart}
              />
            </ChartAndData>
          )}

          {combineWithReturnChart && birthChart && (
            <ChartAndData
              birthChart={lunarChart}
              useArchArabicParts
              customArabicParts={parts}
            >
              <AstroChart
                planets={solarReturnChart.planets}
                housesData={solarReturnChart.housesData}
                arabicParts={archArabicParts}
                outerPlanets={lunarChart.planets}
                outerHouses={lunarChart.housesData}
                outerArabicParts={parts}
                combineWithReturnChart={toggleShowReturnCombinedchart}
              />
            </ChartAndData>
          )}

          {/* <div className="flex flex-row justify-between mt-8">
            <div>
              <h2 className="font-bold text-lg mb-2">Casas:</h2>
              <ul className="mb-4">
                {lunarChart.housesData.housesWithSigns?.map((house, index) => (
                  <li key={house}>
                    Casa {index + 1}: {house}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-2">Planetas:</h2>
              <ul>
                {lunarChart.planets?.map((planet, index) => (
                  <li key={planet.name}>
                    {lunarChart.planetsWithSigns !== undefined && (
                      <>
                        {planet.name}:{" "}
                        {lunarChart.planetsWithSigns[index].position}
                        &nbsp;Antiscion:{" "}
                        {lunarChart.planetsWithSigns[index].antiscion}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <BirthArchArabicParts
            customArabicParts={parts}
            useCustomASCControls={false}
          /> */}
        </div>
      )}
    </div>
  );
};

export default LunarDerivedChart;
