"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { useRef, useState } from "react";
import { getHourAndMinute } from "../utils/chartUtils";
import {
  BirthDate,
  Coordinates,
  ReturnChartType,
  SelectedCity,
} from "@/interfaces/BirthChartInterfaces";
import { ChartDate } from "./ChartDate";
import CitySearch from "./CitySearch";
import AstroChart from "./AstroChart";

export default function BirthChart() {
  const [loading, setLoading] = useState(false);
  const { birthChart, updateBirthChart } = useBirthChart();

  const birthTime = 6.75; // 06h45
  const hourAndMinuteHour = getHourAndMinute(birthTime);

  const coordinates: Coordinates = {
    latitude: -3.71839, // Fortaleza
    longitude: -38.5434,
  };

  const birthDate: BirthDate = {
    year: 1993,
    month: 8,
    day: 31,
    time: hourAndMinuteHour,
    coordinates,
  };

  const getBirthChart = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          hour: birthTime,
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
    const targetDate: BirthDate = {
      ...birthDate,
      year: returnType === "solar" ? 2024 : 2025,
    };

    const response = await fetch("http://localhost:3001/return/" + returnType, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate,
        birthTime,
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
    <div className="flex flex-col items-center gap-2 pt-4">
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
          />

          <h2 className="font-bold text-lg mb-2">Casas Astrológicas:</h2>
          <ul className="mb-4">
            {birthChart.housesData.housesWithSigns?.map((house, index) => (
              <li key={house}>
                Casa {index + 1}: {house}
              </li>
            ))}
          </ul>

          <h2 className="font-bold text-lg mb-2">Planetas:</h2>
          <ul>
            {birthChart.planets?.map((planet, index) => (
              <li key={planet.name}>
                {birthChart.planetsWithSigns !== undefined && (
                  <>
                    {planet.name}: {birthChart.planetsWithSigns[index].position}
                    &nbsp;Antiscion:{" "}
                    {birthChart.planetsWithSigns[index].antiscion}
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
