"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { useRef, useState } from "react";
import { getHourAndMinute } from "../utils/chartUtils";

export default function BirthChart() {
  const [loading, setLoading] = useState(false);
  const { birthChart, updateBirthChart } = useBirthChart();

  const getBirthChart = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: 31,
          month: 8,
          year: 1993,
          hour: 6.75, // 6h45
          latitude: -3.71839, // Fortaleza
          longitude: -38.5434,
        }),
      });

      const data = await response.json();
      updateBirthChart({ chartData: data, isReturnChart: false });
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSolarReturn = async () => {
    const birthTime = 6.75;
    const targetDate = {
      year: 2024,
      month: 8,
      day: 31,
      time: getHourAndMinute(birthTime),
    };

    const response = await fetch("http://localhost:3001/return/solar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: { year: 1993, month: 8, day: 31 },
        birthTime: birthTime,
        sunLongitude: 158,
        targetDate,
        birthLatitude: -3.71839,
        birthLongitude: -38.5434,
      }),
    });

    if (!response.ok) {
      console.log(response);
      throw new Error("Erro ao buscar a Revolução Solar");
    }

    const data = await response.json();

    console.log("Revolução Solar:");
    console.log(data);
    updateBirthChart({ chartData: data, isReturnChart: false });
    updateBirthChart({
      chartData: {
        planets: data.returnPlanets,
        housesData: data.returnHousesData,
        planetsWithSigns: undefined,
        returnType: "solar",
        birthDate: {
          year: 1993,
          month: 8,
          day: 31,
          time: getHourAndMinute(birthTime),
        },
        targetDate,
      },
      isReturnChart: true,
    });
  };

  const getLunarReturn = async () => {
    const birthTime = 6.75;
    const hourAndMinuteHour = getHourAndMinute(birthTime);
    const targetDate = {
      year: 2025,
      month: 8,
      day: 31,
      time: hourAndMinuteHour,
    };

    const response = await fetch("http://localhost:3001/return/lunar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: { year: 1993, month: 8, day: 31 },
        birthTime,
        moonLongitude: 330.21,
        targetDate,
        birthLatitude: -3.71839,
        birthLongitude: -38.5434,
      }),
    });

    if (!response.ok) {
      console.log(response);
      throw new Error("Erro ao buscar a Revolução Solar");
    }

    const data = await response.json();

    console.log("Revolução Lunar:");
    console.log(data);
    updateBirthChart({ chartData: data, isReturnChart: false });
    updateBirthChart({
      chartData: {
        planets: data.returnPlanets,
        housesData: data.returnHousesData,
        planetsWithSigns: undefined,
        returnType: "lunar",
        birthDate: {
          year: 1993,
          month: 8,
          day: 31,
          time: hourAndMinuteHour,
        },
        targetDate,
      },
      isReturnChart: true,
    });
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
        onClick={getSolarReturn}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Revolução Solar
      </button>

      <button
        onClick={getLunarReturn}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Revolução Lunar
      </button>

      {loading && <p>Carregando...</p>}

      {birthChart && (
        <div className="mt-6 text-left">
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
