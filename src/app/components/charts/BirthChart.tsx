'use client'

import { useBirthChart } from "@/contexts/BirthChartContext";
import { JSX, useEffect, useRef, useState } from "react";
import {
  convertDegMinToDecimal,
  monthsNames,
} from "../../utils/chartUtils";
import {
  BirthChartProfile,
  BirthDate,
  ReturnChartType,
} from "@/interfaces/BirthChartInterfaces";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import ReturnChart from "./ReturnChart";
import { ChartMenuType, useChartMenu } from "@/contexts/ChartMenuContext";
import LunarDerivedChart from "./LunarDerivedChart";
import BirthChartForm from "./BirthChartForm";
import PresavedChartsDropdown from "./PresavedChartsDropdown";
import { useProfiles } from "@/contexts/ProfilesContext";
import { apiFetch } from "@/app/utils/api";
import SinastryChart from "./SinastryChart";
import Spinner from "../Spinner";
import Container from "../Container";
import SecondaryProgressionChart from "./SecondaryProgressionChart";

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
    progressionChart,
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
  const [progressionYear, setProgressionYear] = useState<number | undefined>(
    undefined
  );

  const firstProfileSetAtBeggining = useRef(false);

  const { chartMenu, addChartMenu, updateChartMenuDirectly } = useChartMenu();
  const { calculateArabicParts, calculateBirthArchArabicParts } =
    useArabicParts();

  const [menu, setMenu] = useState<MenuButtonChoice>("home");
  const [isClientReady, setIsClientReady] = useState(false);
  const [activeChart, setActiveChart] = useState(chartMenu);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const solarReturnForm = useRef<HTMLFormElement>(null);
  const lunarReturnForm = useRef<HTMLFormElement>(null);
  const progressionForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (chartMenu === activeChart) return;

    setIsTransitioning(true);
    setActiveChart(chartMenu);

    const timeout = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [chartMenu]);

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
    if (progressionChart) {
      calculateBirthArchArabicParts(progressionChart.housesData.ascendant);
    } else {
      setProgressionYear(undefined);
    }
  }, [progressionChart]);

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

  async function getBirthChart(chartProfileToOverwrite?: BirthChartProfile) {
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
        chartType: "birth",
      });
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    } finally {
      setLoading(false);
    }
  }

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
      chartType: "birth",
      profileName: chartProfile?.name,
      chartData: {
        ...data,
        birthDate: chartProfile?.birthDate,
        targetDate,
      },
    });

    if (chartProfile) {
      updateBirthChart({
        chartType: "return",
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
      coordinates: currentCity ?? {
        latitude: 0,
        longitude: 0
      },
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
        chartType: "birth",
      });

      updateBirthChart({
        profileName: sinastryProfile?.name,
        chartData: {
          ...sinastryData,
          birthDate: sinastryProfile?.birthDate,
        },
        chartType: "sinastry",
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
      return "Escolha um mapa e digite o ano da revolução";
    else if (menu === "sinastry")
      return "Escolha os mapas a serem combinados em sinastria";
    else if (menu === "secondaryProgressions") return "Progressões Secundárias";

    return "Sem título";
  }

  async function makeSecondaryProgression() {
    let birthDate = chartProfile?.birthDate;
    if (!birthDate || !progressionYear) return;

    const jsDate = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    jsDate.setDate(jsDate.getDate() + progressionYear);

    birthDate = {
      ...birthDate,
      day: jsDate.getDate(),
      month: jsDate.getMonth() + 1,
      year: jsDate.getFullYear(),
    };

    await getBirthChart();
    setLoading(true);

    try {
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
        }),
      });

      updateBirthChart({
        profileName: chartProfile?.name,
        chartData: {
          ...data,
          birthDate,
        },
        chartType: "progression",
      });

      const chartType: ChartMenuType = "progression";
      addChartMenu(chartType);
      updateChartMenuDirectly(chartType);
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    } finally {
      setLoading(false);
    }
  }

  function _getDebugData(): JSX.Element {
    return (
      <div className="h-fit text-center">
        <span className="font-bold text-xl">:: Debugging ::</span>

        <div className="flex flex-col text-start items-start mt-2 gap-1">
          <span>
            birthChart === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(birthChart === undefined).toString()}
            </span>
          </span>
          <span>
            menu: <strong>{menu}</strong>
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
            archArabicParts === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(archArabicParts === undefined).toString()}
            </span>
          </span>
          <span>
            lunarDerivedChart === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(lunarDerivedChart === undefined).toString()}
            </span>
          </span>
        </div>
      </div>
    );
  }

  function canRenderChart(): boolean {
    if ((menu === "birthChart" || menu === "home") && birthChart) return true;
    if ((menu === "solarReturn" || menu === "lunarReturn") && returnChart) return true;
    if (menu === "sinastry" && sinastryChart) return true;
    if (menu === "secondaryProgressions" && progressionChart && birthChart) return true;

    return false;
  }

  const getInitialMenuContent = (): JSX.Element =>
    <Container className="w-[90%] sm:w-1/4">
      <h2 className="text-[1rem] sm:text-lg text-center sm:text-start pt-4 px-2 sm:pt-0 sm:mb-4 font-bold">
        {getTitleMenuTitle()}
      </h2>

      <div className="w-full p-4 sm:p-0 flex flex-col gap-2">
        {menu === "home" && (
          <div className="w-full flex flex-col gap-2">
            <button
              className="default-btn"
              onClick={() => setMenu("birthChart")}
            >
              Mapa Natal
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("solarReturn")}
            >
              Revolução Solar
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("lunarReturn")}
            >
              Revolução Lunar
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("sinastry")}
            >
              Combinar mapas (Sinastria)
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("secondaryProgressions")}
            >
              Progressão Secundária
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
                className="default-btn"
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
                className="default-btn"
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
              className="default-btn"
            >
              Gerar sinastria
            </button>
          </>
        )}

        {menu === "home" && (
          <button
            onClick={() => getMomentBirthChart()}
            className="default-btn"
          >
            Mapa do Momento
          </button>
        )}

        {menu === "secondaryProgressions" && (
          <form
            ref={progressionForm}
            className="w-full flex flex-col justify-between gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              makeSecondaryProgression();
            }}
          >
            <span>Selecione o mapa:</span>
            <PresavedChartsDropdown
              onChange={(profile) => setChartProfile(profile)}
            />

            <div className="flex flex-row items-center gap-2">
              <label className="text-nowrap">Número de anos:</label>
              <input
                required
                type="number"
                placeholder="ex: 30"
                className="w-full border-2 p-1 rounded-sm"
                value={progressionYear ?? ""}
                onChange={(e) => {
                  const parsed = Number.parseInt(e.target.value);
                  if (Number.isNaN(parsed)) {
                    setProgressionYear(undefined);
                    return;
                  }

                  let val = parsed;
                  if (val < 0) val = 0;
                  setProgressionYear(val);
                }}
              />
            </div>

            <button
              type="submit"
              className="default-btn"
            >
              Gerar Progressão
            </button>
          </form>
        )}

        {menu !== "home" && (
          <button
            className="default-btn"
            onClick={() => setMenu("home")}
          >
            Voltar
          </button>
        )}

        <span
          className={`w-full text-start flex flex-row items-center justify-center gap-3 mt-2 ${loading ? "opacity-100" : "opacity-0"
            }`}
        >
          <Spinner />
          <span>Carregando...</span>
        </span>
      </div>
    </Container>

  const getChartContent = (): JSX.Element | null => {
    switch (activeChart) {
      case "birth":
        return birthChart ? <div className="w-full flex flex-col items-center">
          <div className="w-full text-left flex flex-col items-center mb-4">
            <ChartAndData
              arabicParts={arabicParts}
              title={`Mapa Natal - ${profileName}`}
              innerChart={birthChart}
              chartDateProps={{
                chartType: "birth",
                birthChart,
              }}
            />
          </div>
        </div> : null;

      case "solarReturn":
      case "lunarReturn":
        return returnChart ? <ReturnChart /> : null;

      case "lunarDerivedReturn":
        return lunarDerivedChart && archArabicParts && arabicParts ? (
          <LunarDerivedChart />
        ) : null;

      case "sinastry":
        return sinastryChart ? (
          <SinastryChart
            sinastryChart={sinastryChart}
            sinastryProfileName={sinastryProfile?.name}
          />
        ) : null;

      case "progression":
        return <SecondaryProgressionChart />;

      default: return null;
    }

    // <>
    //   {birthChart && chartMenu === "birth" && (
    //     <div className="w-full flex flex-col items-center">
    //       <div className="w-full text-left flex flex-col items-center mb-4">
    //         <ChartAndData
    //           arabicParts={arabicParts}
    //           title={`Mapa Natal - ${profileName}`}
    //           innerChart={birthChart}
    //           chartDateProps={{
    //             chartType: "birth",
    //             birthChart,
    //           }}
    //         />
    //       </div>
    //     </div>
    //   )}

    //   {returnChart && (chartMenu === "solarReturn" || chartMenu === "lunarReturn") && (
    //     <ReturnChart />
    //   )}

    //   {chartMenu === "lunarDerivedReturn" &&
    //     lunarDerivedChart &&
    //     archArabicParts &&
    //     arabicParts && <LunarDerivedChart />}

    //   {chartMenu === "sinastry" && sinastryChart && (
    //     <SinastryChart
    //       sinastryChart={sinastryChart}
    //       sinastryProfileName={sinastryProfile?.name}
    //     />
    //   )}

    //   {chartMenu === "progression" && (
    //     <SecondaryProgressionChart />
    //   )}
    // </>
  }

  if (!isClientReady) {
    return <Container className="w-[90%] md:w-1/4 h-[416px] md:h-[428px] flex flex-col items-center justify-center space-y-3 ">
      <Spinner size="16" />
      <span className="pl-5">Carregando...</span>
    </Container>
  }

  return (
    <div className="w-[98vw] min-h-[50vh] mt-4 flex flex-col items-center justify-center gap-2">
      {!canRenderChart() ? getInitialMenuContent() :
        <>
          {isTransitioning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`absolute w-full h-full top-0 md:top-auto md:h-[108%] px-3 md:px-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-10 
                  md:rounded-2xl transition-all duration-200 ease-in-out opacity-0 animate-[fadeIn_0.2s_forwards]`}
              >
                <Spinner size="16" />
                <h2 className="font-bold text-lg pl-10 mt-3">Carregando...</h2>
              </div>
            </div>
          )}

          <div
            className={`${isTransitioning ? "opacity-0" : "opacity-100"
              } w-full flex items-center justify-center`}
          >
            {getChartContent()}
          </div>
        </>}

      {/* {_getDebugData()} */}
    </div>
  );
}
