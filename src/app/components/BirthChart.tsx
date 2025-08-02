"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { useRef, useState } from "react";
import {
  convertDegMinToDecimal,
  getHourAndMinute,
  monthsName,
} from "../utils/chartUtils";
import {
  BirthDate,
  Coordinates,
  ReturnChartType,
  SelectedCity,
} from "@/interfaces/BirthChartInterfaces";
import { ChartDate } from "./ChartDate";
import CitySearch from "./CitySearch";
import AstroChart from "./AstroChart";
import ArabicParts from "./ArabicParts";
import { useArabicParts } from "@/contexts/ArabicPartsContext";

export default function BirthChart() {
  const [loading, setLoading] = useState(false);
  const { birthChart, updateBirthChart } = useBirthChart();
  const { arabicParts } = useArabicParts();
  const [solarYear, setSolarYear] = useState(0);
  const [lunarDay, setLunarDay] = useState(0);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarYear, setLunarYear] = useState(0);

  const coordinates: Coordinates = {
    latitude: -3.71839, // Fortaleza
    longitude: -38.5434,
  };

  const quixabaCoordinates: Coordinates = {
    latitude: -4.5461,
    longitude: -37.6923,
  };

  const aracatiCoordinates: Coordinates = {
    latitude: -4.56273,
    longitude: -37.7691,
  };

  const SPCoordinates: Coordinates = {
    latitude: -23.5489,
    longitude: -46.6388,
  };

  const MontesClarosCoordinates: Coordinates = {
    latitude: -16.737,
    longitude: -43.8647,
  };

  const icoordinates: Coordinates = {
    latitude: -6.4011,
    longitude: -38.8622,
  };

  const barbacenaCoordinates: Coordinates = {
    latitude: -21.2264,
    longitude: -43.7742,
  };

  // Meu
  // const birthDate: BirthDate = {
  //   year: 1993,
  //   month: 8,
  //   day: 31,
  //   time: convertDegMinToDecimal(6, 45).toString(),
  //   coordinates,
  // };

  // Eli's birth
  const birthDate: BirthDate = {
    year: 1994,
    month: 6,
    day: 23,
    time: convertDegMinToDecimal(20, 19).toString(),
    coordinates: SPCoordinates,
  };

  // Alana
  // const birthDate: BirthDate = {
  //   year: 1997,
  //   month: 5,
  //   day: 1,
  //   time: convertDegMinToDecimal(13, 47).toString(),
  //   coordinates: icoordinates,
  // };

  // Noivado
  // const birthDate: BirthDate = {
  //   year: 2025,
  //   month: 4,
  //   day: 26,
  //   time: convertDegMinToDecimal(17, 10).toString(),
  //   coordinates: aracatiCoordinates,
  // };

  // Jana's birth
  // const birthDate: BirthDate = {
  //   year: 1995,
  //   month: 6,
  //   day: 20,
  //   time: convertDegMinToDecimal(2, 20).toString(),
  //   coordinates: SPCoordinates,
  // };

  // Alinezinha
  // const birthDate: BirthDate = {
  //   year: 1999,
  //   month: 3,
  //   day: 22,
  //   time: convertDegMinToDecimal(12, 39).toString(),
  //   coordinates,
  // };

  // Ana Flávia
  // const birthDate: BirthDate = {
  //   year: 1994,
  //   month: 12,
  //   day: 2,
  //   time: convertDegMinToDecimal(5, 15).toString(),
  //   coordinates: MontesClarosCoordinates,
  // };

  // Lay Curcio
  // const birthDate: BirthDate = {
  //   year: 1995,
  //   month: 5,
  //   day: 11,
  //   time: convertDegMinToDecimal(8, 45).toString(),
  //   coordinates: barbacenaCoordinates,
  // };

  // Eduardo da Lay
  // const birthDate: BirthDate = {
  //   year: 1995,
  //   month: 5,
  //   day: 24,
  //   time: convertDegMinToDecimal(10, 45).toString(),
  //   coordinates: barbacenaCoordinates,
  // };

  const getBirthChart = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          // hour: birthTime,
        }),
      });

      const data = await response.json();
      console.log(data);
      updateBirthChart({
        chartData: {
          ...data,
          birthDate,
        },
        isReturnChart: false,
      });
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanetReturn = async (returnType: ReturnChartType) => {
    // // Meu
    // const targetDate: BirthDate = {
    //   ...birthDate,
    //   year: returnType === "solar" ? 2024 : 2022,
    // };

    const targetDate: BirthDate = {
      ...birthDate,
      day: returnType === "solar" ? birthDate.day : lunarDay,
      month: returnType === "solar" ? birthDate.month : lunarMonth,
      year: returnType === "solar" ? solarYear : lunarYear,
    };

    // Jana
    // const targetDate: BirthDate = {
    //   // ...birthDate,
    //   coordinates: birthDate.coordinates,
    //   day: 10,
    //   month: 2,
    //   time: birthDate.time,
    //   year: returnType === "solar" ? 2024 : 2024,
    // };

    // console.log("birthDate:", birthDate);
    // console.log("targetDate:", targetDate);

    const response = await fetch("http://localhost:3001/return/" + returnType, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate,
        // birthTime,
        targetDate,
      }),
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(`Erro ao buscar a Revolução ${returnType}.`);
    }

    const data = await response.json();

    // console.log(`Revolução ${returnType}:`);
    // console.log(data);
    updateBirthChart({
      isReturnChart: false,
      chartData: {
        ...data,
        birthDate,
        targetDate,
      },
    });
    updateBirthChart({
      isReturnChart: true,
      chartData: {
        planets: data.returnPlanets,
        housesData: data.returnHousesData,
        returnType,
        birthDate,
        targetDate,
        returnTime: data.returnTime,
      },
    });
  };

  const selectCity = (selectedCity: SelectedCity) => {
    console.log("Cidade Selecionada:");
    console.log(selectedCity);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 pt-4">
      <button
        onClick={getBirthChart}
        className="bg-blue-600 w-1/5 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Consultar Mapa Natal
      </button>

      <input
        className="border-2 rounded-sm w-1/5 px-1"
        placeholder="Ano Rev. Solar"
        type="number"
        onChange={(e) => {
          if (e.target.value.length > 0) {
            let number = Number.parseInt(e.target.value);
            if (number < 0) number = 0;
            if (number > 3000) number = 2999;
            setSolarYear(number);
            e.target.value = number.toString();
          }
        }}
      />

      <button
        onClick={() => getPlanetReturn("solar")}
        className="bg-blue-600 w-1/5 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Revolução Solar
      </button>

      <form className="w-1/5 flex flex-row justify-between gap-1">
        <input
          className="border-2 rounded-sm w-1/5 px-1"
          placeholder="Dia"
          type="number"
          onChange={(e) => {
            if (e.target.value.length > 0) {
              let val = Number.parseInt(e.target.value);
              if (val < 1) val = 1;
              if (val > 31) val = 31;
              setLunarDay(val);
              e.target.value = val.toString();
            }
          }}
        />

        <select
          className="border-2 w-1/2 rounded-sm"
          onChange={(e) => setLunarMonth(Number.parseInt(e.target.value) + 1)}
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
              setLunarYear(val);
              e.target.value = val.toString();
            }
          }}
        />
      </form>

      <button
        onClick={() => getPlanetReturn("lunar")}
        className="bg-blue-600 w-1/5 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Revolução Lunar
      </button>

      {/* <CitySearch onSelect={selectCity} /> */}

      {loading && <p>Carregando...</p>}

      {birthChart && (
        <div className="mt-6 text-left">
          <ChartDate chartType="birth" />
          <AstroChart
            planets={birthChart.planets}
            housesData={birthChart.housesData}
            arabicParts={arabicParts}
          />

          <div className="flex flex-row justify-between mt-8">
            <div>
              <h2 className="font-bold text-lg mb-2">Casas:</h2>
              <ul className="mb-4">
                {birthChart.housesData.housesWithSigns?.map((house, index) => (
                  <li key={house}>
                    Casa {index + 1}: {house}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-2">Planetas:</h2>
              <ul>
                {birthChart.planets?.map((planet, index) => (
                  <li key={index}>
                    {birthChart.planetsWithSigns !== undefined && (
                      <>
                        {planet.name}:{" "}
                        {birthChart.planetsWithSigns[index].position}
                        &nbsp;Antiscion:{" "}
                        {birthChart.planetsWithSigns[index].antiscion}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ArabicParts />
        </div>
      )}
    </div>
  );
}
