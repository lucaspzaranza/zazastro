"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { useRef, useState } from "react";

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
      console.log("mapa:");
      console.log(data);

      updateBirthChart(data);
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 pt-4">
      <h1 className="text-xl font-bold">Consultar Mapa Astral</h1>
      <button
        onClick={getBirthChart}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Consultar
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
                {planet.name}: {birthChart.planetsWithSigns[index].position},
                Antiscion: {birthChart.planetsWithSigns[index].antiscion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
