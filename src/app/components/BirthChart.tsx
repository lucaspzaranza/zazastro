"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { useRef, useState } from "react";
import { convertDegMinToDecimal, getHourAndMinute } from "../utils/chartUtils";
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

  const coordinates: Coordinates = {
    latitude: -3.71839, // Fortaleza
    longitude: -38.5434,
  };

  const quixabaCoordinates: Coordinates = {
    latitude: -4.5461,
    longitude: -37.6923,
  };

  const SPCoordinates: Coordinates = {
    latitude: -23.5489,
    longitude: -46.6388,
  };

  const MontesClarosCoordinates: Coordinates = {
    latitude: -16.737,
    longitude: -43.8647,
  };

  // Meu
  const birthDate: BirthDate = {
    year: 1993,
    month: 8,
    day: 31,
    time: convertDegMinToDecimal(6, 45).toString(),
    coordinates,
  };

  // Eli's birth
  // const birthDate: BirthDate = {
  //   year: 1994,
  //   month: 6,
  //   day: 23,
  //   time: convertDegMinToDecimal(20, 19).toString(),
  //   coordinates: SPCoordinates,
  // };

  // Noivado
  // const birthDate: BirthDate = {
  //   year: 2025,
  //   month: 4,
  //   day: 26,
  //   time: convertDegMinToDecimal(17, 10).toString(),
  //   coordinates: quixabaCoordinates,
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
    // Meu
    // const targetDate: BirthDate = {
    //   ...birthDate,
    //   year: returnType === "solar" ? 2022 : 2022,
    // };

    const targetDate: BirthDate = {
      ...birthDate,
      day: 1,
      month: 11,
      // time: birthDate.time,
      year: returnType === "solar" ? 2024 : 2025,
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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Consultar Mapa Natal
      </button>

      <button
        onClick={() => getPlanetReturn("solar")}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Revolução Solar
      </button>

      <button
        onClick={() => getPlanetReturn("lunar")}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
