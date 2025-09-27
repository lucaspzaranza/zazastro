"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import { useEffect, useRef, useState } from "react";
import {
  convertDegMinToDecimal,
  fortalCoords,
  monthsNames,
} from "../../utils/chartUtils";
import {
  BirthChartProfile,
  BirthDate,
  ReturnChartType,
} from "@/interfaces/BirthChartInterfaces";
import { ChartDate } from ".././ChartDate";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import ReturnChart from "./ReturnChart";
import ChartSelectorArrows from "../ChartSelectorArrows";
import { ChartMenuType, useChartMenu } from "@/contexts/ChartMenuContext";
import LunarDerivedChart from "./LunarDerivedChart";
import BirthChartForm from "./BirthChartForm";
import PresavedChartsDropdown from "./PresavedChartsDropdown";
import { useProfiles } from "@/contexts/ProfilesContext";
import { apiFetch } from "@/app/utils/api";
import SinastryChart from "./SinastryChart";
import Spinner from "../Spinner";

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
  const {
    profileName,
    birthChart,
    returnChart,
    lunarDerivedChart,
    updateBirthChart,
    currentCity,
    updateCurrentCity,
    sinastryChart,
  } = useBirthChart();
  const { profiles } = useProfiles();
  const { arabicParts, archArabicParts } = useArabicParts();
  const [solarYear, setSolarYear] = useState(0);
  const [lunarDay, setLunarDay] = useState(1);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarYear, setLunarYear] = useState(0);
  const [chartProfile, setChartProfile] = useState<
    BirthChartProfile | undefined
  >(profiles[0]);
  const [sinastryProfile, setSinastryProfile] = useState<
    BirthChartProfile | undefined
  >();

  const firstProfileSetAtBeggining = useRef(false);

  const { chartMenu, addChartMenu, updateChartMenuDirectly } = useChartMenu();
  const { calculateArabicParts, calculateBirthArchArabicParts } =
    useArabicParts();

  const [menu, setMenu] = useState<MenuButtonChoice>("home");

  const solarReturnForm = useRef<HTMLFormElement>(null);
  const lunarReturnForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (birthChart === undefined && returnChart === undefined) {
      setMenu("home");
    }

    if (lunarDerivedChart) {
      addChartMenu("lunarDerivedReturn");
      updateChartMenuDirectly("lunarDerivedReturn");
    }
  }, [birthChart, returnChart, lunarDerivedChart]);

  useEffect(() => {
    if (birthChart) {
      calculateArabicParts(birthChart, "birth");
    }
  }, [birthChart]);

  useEffect(() => {
    if (returnChart) {
      calculateBirthArchArabicParts(returnChart.housesData.ascendant, {
        isLunarDerivedChart: false,
      });
    }
  }, [returnChart, arabicParts]);

  useEffect(() => {
    if (lunarDerivedChart) {
      calculateBirthArchArabicParts(lunarDerivedChart.housesData.ascendant, {
        isLunarDerivedChart: true,
      });
    }
  }, [lunarDerivedChart]);

  useEffect(() => {
    if (sinastryChart) {
      calculateArabicParts(sinastryChart, "sinastry");
    }
  }, [sinastryChart]);

  useEffect(() => {
    if (menu === "home") {
      firstProfileSetAtBeggining.current = false;
      setChartProfile(profiles[0]);
      setSinastryProfile(profiles[0]);
    }
  }, [menu, chartProfile]);

  useEffect(() => {
    if (profiles.length > 0 && !firstProfileSetAtBeggining.current) {
      setChartProfile(profiles[0]);
      firstProfileSetAtBeggining.current = true;
    }
  }, [profiles]);

  const getBirthChart = async (chartProfileToOverwrite?: BirthChartProfile) => {
    setLoading(true);
    if (chartProfileToOverwrite) {
      setChartProfile(chartProfileToOverwrite);
    }

    updateCurrentCity(chartProfileToOverwrite?.birthDate?.coordinates);

    try {
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate:
            chartProfileToOverwrite?.birthDate ?? chartProfile?.birthDate,
        }),
      });

      updateBirthChart({
        profileName: chartProfileToOverwrite?.name ?? chartProfile?.name,
        chartData: {
          ...data,
          birthDate:
            chartProfileToOverwrite?.birthDate ?? chartProfile?.birthDate,
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

    if (!chartProfile) return;

    const targetDate: BirthDate = {
      ...chartProfile.birthDate!,
      day: returnType === "solar" ? chartProfile.birthDate!.day : lunarDay,
      month:
        returnType === "solar" ? chartProfile.birthDate!.month : lunarMonth,
      year: returnType === "solar" ? solarYear : lunarYear,
    };

    updateCurrentCity(chartProfile.birthDate!.coordinates);

    const data = await apiFetch("return/" + returnType, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: chartProfile?.birthDate,
        targetDate,
      }),
    });

    updateBirthChart({
      isReturnChart: false,
      profileName: chartProfile?.name,
      chartData: {
        ...data,
        birthDate: chartProfile?.birthDate,
        targetDate,
      },
    });

    if (chartProfile) {
      updateBirthChart({
        isReturnChart: true,
        chartData: {
          planets: data.returnPlanets,
          housesData: data.returnHousesData,
          returnType,
          birthDate: chartProfile.birthDate!,
          targetDate,
          returnTime: data.returnTime,
          fixedStars: data.fixedStars,
          timezone: data.timezone,
        },
      });

      const chartType: ChartMenuType =
        returnType === "solar" ? "solarReturn" : "lunarReturn";
      addChartMenu(chartType);
      updateChartMenuDirectly(chartType);
      setLoading(false);
    }
  };

  const getMomentBirthChart = async () => {
    const now = new Date();
    const hourString = convertDegMinToDecimal(
      now.getHours(),
      now.getMinutes()
    ).toString();

    const birthDate: BirthDate = {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      time: hourString,
      coordinates: currentCity ?? fortalCoords,
    };

    // console.log(birthDate);

    getBirthChart({
      name: "Mapa do Momento",
      birthDate,
    });
  };

  const makeSinastryCharts = async () => {
    setLoading(true);

    if (!chartProfile) {
      setLoading(false);
      return;
    }

    updateCurrentCity(chartProfile.birthDate?.coordinates);

    try {
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: chartProfile?.birthDate,
        }),
      });

      const sinastryData = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: sinastryProfile?.birthDate,
        }),
      });

      updateBirthChart({
        profileName: chartProfile?.name,
        chartData: {
          ...data,
          birthDate: chartProfile?.birthDate,
        },
        isReturnChart: false,
      });

      updateBirthChart({
        profileName: sinastryProfile?.name,
        chartData: {
          ...sinastryData,
          birthDate: sinastryProfile?.birthDate,
        },
        isReturnChart: false,
        isSinastryChart: true,
      });

      const chartType: ChartMenuType = "sinastry";
      addChartMenu(chartType);
      updateChartMenuDirectly(chartType);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    } finally {
      setLoading(false);
    }
  };

  function getTitleMenuTitle(): string {
    if (menu === "home") return "Selecione o tipo de mapa que deseja";
    else if (menu === "birthChart")
      return "Escolha ou crie um novo mapa astral";
    else if (menu === "solarReturn" || menu === "lunarReturn")
      return "Escolha um mapa e digite o ano da revolução ";
    else if (menu === "sinastry")
      return "Escolha os mapas a serem combinados em sinastria.";

    return "";
  }

  return (
    <div className="w-[98vw] min-h-[50vh] mt-4 flex flex-col items-center justify-center gap-2">
      {birthChart === undefined && (
        <div className="w-full flex flex-col items-center justify-center">
          <h2 className="text-[1rem] sm:text-lg py-0 my-0 text-center sm:text-start mb-1">
            {getTitleMenuTitle()}
          </h2>

          <div className="w-full p-4 sm:w-1/4 sm:p-0 flex flex-col gap-2">
            {menu === "home" && (
              <div className="flex flex-col gap-2">
                <button
                  className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
                  onClick={() => setMenu("birthChart")}
                >
                  Mapa Natal
                </button>

                <button
                  className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
                  onClick={() => setMenu("solarReturn")}
                >
                  Revolução Solar
                </button>

                <button
                  className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
                  onClick={() => setMenu("lunarReturn")}
                >
                  Revolução Lunar
                </button>

                <button
                  className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
                  onClick={() => setMenu("sinastry")}
                >
                  Combinar mapas (Sinastria)
                </button>
              </div>
            )}

            {menu === "birthChart" && (
              <BirthChartForm
                currentBirthDate={chartProfile?.birthDate}
                onSubmit={(profile) => getBirthChart(profile)}
              />
            )}

            {menu === "solarReturn" && (
              <>
                <PresavedChartsDropdown
                  onChange={(profile) => setChartProfile(profile)}
                />
                <form
                  ref={solarReturnForm}
                  className="w-full flex flex-col items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      solarReturnForm.current &&
                      solarReturnForm.current.checkValidity()
                    ) {
                      getPlanetReturn("solar");
                    } else {
                      solarReturnForm.current?.reportValidity();
                    }
                  }}
                >
                  <input
                    required
                    className="border-2 rounded-sm w-full p-1"
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
                    onClick={(e) => {
                      e.preventDefault();
                      if (
                        solarReturnForm.current &&
                        solarReturnForm.current.checkValidity()
                      ) {
                        getPlanetReturn("solar");
                      } else {
                        solarReturnForm.current?.reportValidity();
                      }
                    }}
                    className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
                  >
                    Revolução Solar
                  </button>
                </form>
              </>
            )}

            {menu === "lunarReturn" && (
              <>
                <PresavedChartsDropdown
                  onChange={(newProfile) => setChartProfile(newProfile)}
                />
                <form
                  ref={lunarReturnForm}
                  className="w-full flex flex-col justify-between gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      lunarReturnForm.current &&
                      lunarReturnForm.current.checkValidity()
                    ) {
                      getPlanetReturn("lunar");
                    } else {
                      lunarReturnForm.current?.reportValidity();
                    }
                  }}
                >
                  <div className="w-full flex flex-row justify-between gap-1">
                    <input
                      required
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
                      required
                      className="border-2 w-1/2 rounded-sm"
                      value={lunarMonth}
                      onChange={(e) =>
                        setLunarMonth(Number.parseInt(e.target.value))
                      }
                    >
                      {monthsNames.map((month, index) => (
                        <option key={index} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>

                    <input
                      required
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
                    onClick={(e) => {
                      e.preventDefault();
                      if (
                        lunarReturnForm.current &&
                        lunarReturnForm.current.checkValidity()
                      ) {
                        getPlanetReturn("lunar");
                      } else {
                        lunarReturnForm.current?.reportValidity();
                      }
                    }}
                    className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
                  >
                    Revolução Lunar
                  </button>
                </form>
              </>
            )}

            {menu === "sinastry" && (
              <>
                <span>Primeiro mapa:</span>
                <PresavedChartsDropdown
                  onChange={(profile) => setChartProfile(profile)}
                />

                <span>Segundo mapa:</span>
                <PresavedChartsDropdown
                  onChange={(profile) => setSinastryProfile(profile)}
                />

                <button
                  onClick={() => makeSinastryCharts()}
                  className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
                >
                  Gerar sinastria
                </button>
              </>
            )}

            {menu === "home" && (
              <button
                onClick={() => getMomentBirthChart()}
                className="bg-blue-800 w-full text-white px-4 py-2 rounded hover:bg-blue-900"
              >
                Mapa do Momento
              </button>
            )}

            {menu !== "home" && (
              <button
                className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setMenu("home")}
              >
                Voltar
              </button>
            )}

            {loading && (
              <span className="w-full text-start flex flex-row items-center justify-center gap-3 mt-2">
                <Spinner />
                <span>Carregando...</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* <div className="h-fit text-center">
        <span className="font-bold text-xl">:: Debugging ::</span>

        <div className="flex flex-col text-start items-start mt-2 gap-1">
          <span>
            birthChart === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(birthChart === undefined).toString()}
            </span>
          </span>
          <span>
            chartMenu: <span className="font-bold">{chartMenu}</span>
          </span>
          <span>
            sinastryChart === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(sinastryChart === undefined).toString()}
            </span>
          </span>
          <span>
            arabicParts === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(arabicParts === undefined).toString()}
            </span>
          </span>
          <span>
            lunarDerivedChart === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(lunarDerivedChart === undefined).toString()}
            </span>
          </span>
        </div>
      </div> */}

      {birthChart && chartMenu === "birth" && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full text-left flex flex-col items-center mb-4">
            <ChartSelectorArrows className="w-full md:w-[60%] mb-2">
              <h1 className="text-lg md:text-2xl font-bold text-center">
                Mapa Natal - {profileName}
              </h1>
            </ChartSelectorArrows>
            <ChartDate chartType="birth" birthChart={birthChart} />
            <ChartAndData
              arabicParts={arabicParts}
              innerChart={birthChart}
              useArchArabicPartsForDataVisualization={false}
            />
          </div>
        </div>
      )}

      {returnChart &&
        // arabicParts &&
        (chartMenu === "solarReturn" || chartMenu === "lunarReturn") && (
          <ReturnChart />
        )}

      {chartMenu === "lunarDerivedReturn" &&
        lunarDerivedChart &&
        archArabicParts &&
        arabicParts && <LunarDerivedChart />}

      {chartMenu === "sinastry" && sinastryChart && (
        <SinastryChart
          sinastryChart={sinastryChart}
          sinastryProfileName={sinastryProfile?.name}
        />
      )}
    </div>
  );
}
