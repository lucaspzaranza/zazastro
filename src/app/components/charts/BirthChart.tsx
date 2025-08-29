"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { useEffect, useRef, useState } from "react";
import {
  convertDegMinToDecimal,
  fortalCoords,
  getHourAndMinute,
  monthsNames,
  presavedBirthDates,
} from "../../utils/chartUtils";
import {
  BirthDate,
  Coordinates,
  ReturnChartType,
  SelectedCity,
} from "@/interfaces/BirthChartInterfaces";
import { ChartDate } from ".././ChartDate";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import HousesAndPlanetsData from ".././ChartAndData";
import ChartAndData from ".././ChartAndData";
import moment from "moment-timezone";
import ReturnChart from "./ReturnChart";
import ChartSelectorArrows from "../ChartSelectorArrows";
import { useChartMenu } from "@/contexts/ChartMenuContext";

type MenuButtonChoice =
  | "home"
  | "birthChart"
  | "momentChart"
  | "solarReturn"
  | "lunarReturn"
  | "sinastry"
  | "secondaryProgressions";

export default function BirthChart() {
  const [loading, setLoading] = useState(false);
  const { birthChart, returnChart, updateBirthChart } = useBirthChart();
  const { arabicParts } = useArabicParts();
  const [solarYear, setSolarYear] = useState(0);
  const [lunarDay, setLunarDay] = useState(0);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarYear, setLunarYear] = useState(0);
  const [birthDate, setBirthDate] = useState<BirthDate | undefined>(
    presavedBirthDates.lucasz.birthDate
  );

  const { chartMenu, addChartMenu, updateChartMenuDirectly } = useChartMenu();

  const [menu, setMenu] = useState<MenuButtonChoice>("home");

  useEffect(() => {
    if (birthChart === undefined && returnChart === undefined) {
      setMenu("home");
    }
  }, [birthChart, returnChart]);

  const getBirthChart = async (birthDateToOverwrite?: BirthDate) => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: birthDateToOverwrite ?? birthDate,
        }),
      });

      const data = await response.json();
      // console.log(data.fixedStars);
      updateBirthChart({
        chartData: {
          ...data,
          birthDate: birthDateToOverwrite ?? birthDate,
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
    setLoading(true);

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
        targetDate,
      }),
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(`Erro ao buscar a Revolução ${returnType}.`);
    }

    const data = await response.json();

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
          fixedStars: data.fixedStars,
        },
      });

      setTimeout(() => {
        addChartMenu("return");
        updateChartMenuDirectly("return");
        setLoading(false);
      }, 50);
    }
  };

  const getMomentBirthChart = async () => {
    const now = new Date();
    let hourString = convertDegMinToDecimal(
      now.getHours(),
      now.getMinutes()
    ).toString();

    const birthDate: BirthDate = {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      time: hourString,
      coordinates: fortalCoords,
    };

    // console.log(birthDate);

    getBirthChart(birthDate);
  };

  const selectCity = (selectedCity: SelectedCity) => {
    console.log("Cidade Selecionada:");
    console.log(selectedCity);
  };

  return (
    <div className="w-[98vw] min-h-[50vh] mt-4 flex flex-col items-center justify-center gap-2">
      {birthChart === undefined && (
        <div className="w-full flex flex-col items-center justify-center">
          <h2 className="text-lg py-0 my-0 text-start">
            Selecione o tipo de mapa que deseja
          </h2>
          <div className="w-1/4 flex flex-col gap-2">
            {menu === "home" && (
              <div className="flex flex-col gap-2">
                <button
                  className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => setMenu("birthChart")}
                >
                  Mapa Natal
                </button>

                <button
                  className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => setMenu("solarReturn")}
                >
                  Revolução Solar
                </button>

                <button
                  className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => setMenu("lunarReturn")}
                >
                  Revolução Lunar
                </button>
              </div>
            )}

            {menu !== "home" && (
              <select
                className="border-2 rounded-sm w-full"
                onChange={(e) => {
                  const key = e.target.value;
                  setBirthDate(presavedBirthDates[key].birthDate);
                }}
              >
                {Object.entries(presavedBirthDates).map(
                  ([name, date], index) => (
                    <option key={index} value={name}>
                      {date.name}
                    </option>
                  )
                )}
              </select>
            )}

            {menu === "birthChart" && (
              <div>
                <button
                  onClick={() => getBirthChart()}
                  className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Consultar Mapa Natal
                </button>
              </div>
            )}

            {menu === "solarReturn" && (
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
            )}

            {menu === "lunarReturn" && (
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
            )}

            {/* <CitySearch onSelect={selectCity} /> */}

            {menu === "home" && (
              <button
                onClick={() => getMomentBirthChart()}
                className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Mapa do Momento
              </button>
            )}

            {menu !== "home" && (
              <button
                className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
                onClick={() => setMenu("home")}
              >
                Voltar
              </button>
            )}

            {loading && <p className="w-full text-center">Carregando...</p>}
          </div>
        </div>
      )}

      {birthChart && chartMenu === "birth" && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full text-left flex flex-col items-center mb-4">
            <ChartSelectorArrows className="w-[50%] mb-2">
              <h1 className="text-2xl font-bold text-center">Mapa Astral</h1>
            </ChartSelectorArrows>
            <ChartDate chartType="birth" />
            <ChartAndData
              birthChart={birthChart}
              arabicParts={arabicParts!}
              useArchArabicPartsForDataVisualization={false}
              isSolarReturn={false}
            />
          </div>
        </div>
      )}

      {returnChart && arabicParts && chartMenu === "return" && <ReturnChart />}
    </div>
  );
}
