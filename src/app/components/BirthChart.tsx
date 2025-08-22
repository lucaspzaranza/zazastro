"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { useEffect, useRef, useState } from "react";
import {
  convertDegMinToDecimal,
  getHourAndMinute,
  monthsNames,
  presavedBirthDates,
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
import HousesAndPlanetsData from "./ChartAndData";
import ChartAndData from "./ChartAndData";

export default function BirthChart() {
  const [loading, setLoading] = useState(false);
  const { birthChart, updateBirthChart } = useBirthChart();
  const { arabicParts } = useArabicParts();
  const [solarYear, setSolarYear] = useState(0);
  const [lunarDay, setLunarDay] = useState(0);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarYear, setLunarYear] = useState(0);
  const [birthDate, setBirthDate] = useState<BirthDate | undefined>(
    presavedBirthDates.lucasz.birthDate
  );

  const getBirthChart = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
        }),
      });

      const data = await response.json();
      // console.log(data);
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
      ...birthDate!,
      day: returnType === "solar" ? birthDate?.day! : lunarDay,
      month: returnType === "solar" ? birthDate?.month! : lunarMonth,
      year: returnType === "solar" ? solarYear : lunarYear,
    };

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

    if (birthDate) {
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
    }
  };

  const selectCity = (selectedCity: SelectedCity) => {
    console.log("Cidade Selecionada:");
    console.log(selectedCity);
  };

  return (
    <div className="w-[98vw] flex flex-col items-center gap-2 pt-4">
      <div className="w-1/4 flex flex-col gap-2">
        <select
          className="border-2 rounded-sm w-full"
          onChange={(e) => {
            const key = e.target.value;
            setBirthDate(presavedBirthDates[key].birthDate);
          }}
        >
          {Object.entries(presavedBirthDates).map(([name, date], index) => (
            <option key={index} value={name}>
              {date.name}
            </option>
          ))}
        </select>
        <button
          onClick={getBirthChart}
          className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Consultar Mapa Natal
        </button>

        <form
          className="w-full flex flex-col items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            getPlanetReturn("solar");
          }}
        >
          <input
            className="border-2 rounded-sm w-full px-1"
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
            type="submit"
            onClick={() => getPlanetReturn("solar")}
            className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Revolução Solar
          </button>
        </form>

        <form
          className="w-full flex flex-col justify-between gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            getPlanetReturn("lunar");
          }}
        >
          <div className="w-full flex flex-row justify-between gap-1">
            <input
              className="border-2 rounded-sm w-1/3 px-1"
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
              onChange={(e) =>
                setLunarMonth(Number.parseInt(e.target.value) + 1)
              }
            >
              {monthsNames.map((month, index) => (
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
          </div>

          <button
            type="submit"
            onClick={() => getPlanetReturn("lunar")}
            className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Revolução Lunar
          </button>
        </form>

        {/* <CitySearch onSelect={selectCity} /> */}

        {loading && <p>Carregando...</p>}
      </div>

      {birthChart && (
        <div className="w-full mt-6 text-left">
          <ChartDate chartType="birth" />
          <ChartAndData
            birthChart={birthChart}
            arabicParts={arabicParts!}
            useArchArabicPartsForDataVisualization={false}
          />
        </div>
      )}
    </div>
  );
}
