'use client'

import { useBirthChart } from "@/contexts/BirthChartContext";
import Image from "next/image";
import { JSX, useEffect, useRef, useState } from "react";
import {
  convertDegMinToDecimal,
  getHousesProfection,
  getPlanetsProfection,
  getProfectionChart,
  monthsNames,
} from "../../utils/chartUtils";
import {
  BirthChartProfile,
  BirthDate,
  ReturnChartType,
  BirthChart as BirthChartType,
  TransitsChartFormData
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
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import ProfectionChart from "./ProfectionChart";
import CitySearch from "../CitySearch";
import HouseSystemDropdown from "../HouseSystemDropdown";
import { HouseSystem } from "@/types/HouseSystem";
import { useTranslations } from "next-intl";
import TransitsChartForm from "./TransitsChartForm";

type MenuButtonChoice =
  | "home"
  | "birthChart"
  | "momentChart"
  | "solarReturn"
  | "lunarReturn"
  | "sinastry"
  | "secondaryProgressions"
  | "profection"
  | "transits"
  | "momentMap";

export default function BirthChart() {
  const [loading, setLoading] = useState(false);
  const t = useTranslations();

  const {
    profileName,
    birthChart,
    returnChart,
    lunarDerivedChart,
    progressionChart,
    profectionChart,
    updateBirthChart,
    currentCity,
    selectCity,
    sinastryChart,
    houseSystem,
    updateHouseSystem
  } = useBirthChart();
  const { profiles, currentProfile, updateCurrentSelectedProfile, updateSinastryProfile } = useProfiles();
  const { arabicParts, archArabicParts } = useArabicParts();
  const [solarYear, setSolarYear] = useState(0);
  const [lunarDay, setLunarDay] = useState(1);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarYear, setLunarYear] = useState(0);
  // const [chartProfile, setChartProfile] = useState<
  //   BirthChartProfile | undefined
  // >(profiles[0]);
  const [sinastryProfile, setSinastryProfile] = useState<
    BirthChartProfile | undefined
  >();
  const [progressionYear, setProgressionYear] = useState<number | undefined>(
    undefined
  );

  const [profectionYear, setProfectionYear] = useState<number | undefined>(
    undefined
  );

  const firstProfileSetAtBeggining = useRef(false);

  const { chartMenu, addChartMenu, updateChartMenuDirectly } = useChartMenu();
  const { calculateArabicParts, calculateBirthArchArabicParts } =
    useArabicParts();
  const { screenDimensions, isMobileBreakPoint } = useScreenDimensions();

  const [menu, setMenu] = useState<MenuButtonChoice>("home");
  const [transitsMenu, setTransitsMenu] = useState(0);
  const [isClientReady, setIsClientReady] = useState(false);
  const [activeChart, setActiveChart] = useState(chartMenu);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const solarReturnForm = useRef<HTMLFormElement>(null);
  const lunarReturnForm = useRef<HTMLFormElement>(null);
  const progressionForm = useRef<HTMLFormElement>(null);
  const profectionForm = useRef<HTMLFormElement>(null);

  const iconSize = 22;

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

      if (menu === "profection") {
        makeProfection();
      }
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
    if (profectionChart) {
      calculateBirthArchArabicParts(profectionChart.housesData.ascendant);
    }
  }, [profectionChart]);

  useEffect(() => {
    if (menu === "home") {
      updateHouseSystem("placidus" as HouseSystem);
      firstProfileSetAtBeggining.current = false;
      // setChartProfile(profiles[0]);
      updateCurrentSelectedProfile(profiles[0]);
      setSinastryProfile(profiles[0]);
    }
  // }, [menu, chartProfile]);
  }, [menu]);

  useEffect(() => {
    if (profiles.length > 0 && !firstProfileSetAtBeggining.current) {
      // setChartProfile(profiles[0]);
      updateCurrentSelectedProfile(profiles[0]);
      firstProfileSetAtBeggining.current = true;
    }
  }, [profiles]);

  // useEffect(() => {
  //   updateCurrentSelectedProfile(chartProfile);
  // }, [currentProfile]);

  // useEffect(() => {
  //   setChartProfile(chartProfile);
  // }, [chartProfile]);

  useEffect(() => {
    updateSinastryProfile(sinastryProfile);
  }, [sinastryProfile]);

  async function getBirthChart(chartProfileToOverwrite?: BirthChartProfile) {
    setLoading(true);
    if (chartProfileToOverwrite) {
      // setChartProfile(chartProfileToOverwrite);
      updateCurrentSelectedProfile(chartProfileToOverwrite);
    }

    if (chartProfileToOverwrite?.birthDate?.coordinates)
      selectCity(chartProfileToOverwrite?.birthDate?.coordinates);

    try {
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate:
            { ...chartProfileToOverwrite?.birthDate ?? currentProfile?.birthDate, houseSystem }
        }),
      });

      // console.log(data);

      updateBirthChart({
        profileName: chartProfileToOverwrite?.name ?? currentProfile?.name,
        chartData: {
          ...data,
          birthDate:
            chartProfileToOverwrite?.birthDate ?? currentProfile?.birthDate,
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

    if (!currentProfile) return;

    const targetDate: BirthDate = {
      ...currentProfile.birthDate!,
      day: returnType === "solar" ? currentProfile.birthDate!.day : lunarDay,
      month:
        returnType === "solar" ? currentProfile.birthDate!.month : lunarMonth,
      year: returnType === "solar" ? solarYear : lunarYear,
    };

    if (currentProfile?.birthDate?.coordinates)
      selectCity(currentProfile?.birthDate?.coordinates);

    const data = await apiFetch("return/" + returnType, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: currentProfile?.birthDate,
        targetDate,
      }),
    });

    updateBirthChart({
      chartType: "birth",
      profileName: currentProfile?.name,
      chartData: {
        ...data,
        birthDate: currentProfile?.birthDate,
        targetDate,
      },
    });

    if (currentProfile) {
      updateBirthChart({
        chartType: "return",
        chartData: {
          planets: data.returnPlanets,
          housesData: data.returnHousesData,
          returnType,
          birthDate: currentProfile.birthDate!,
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

    // setMenu("momentChart");
    updateChartMenuDirectly("moment");
    getBirthChart({
      name: t("home.momentChart"),
      birthDate,
    });
  };

  const getChartWithTransits = async (transitsFormData?: TransitsChartFormData) => {
    setLoading(true);

    const now = new Date();
    const hourString = convertDegMinToDecimal(
      now.getHours(),
      now.getMinutes()
    ).toString();

    const transitsDate: BirthDate = (transitsMenu === 1 && transitsFormData) ? transitsFormData.transitsDate : {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      time: hourString,
      coordinates: currentProfile?.birthDate?.coordinates ?? {
        latitude: 0,
        longitude: 0
      },
    };

    if (!currentProfile || (transitsFormData && transitsFormData.profile === undefined)) return;

    if(transitsFormData)
      // setChartProfile(transitsFormData.profile);
      updateCurrentSelectedProfile(transitsFormData.profile);
    else if (currentProfile?.birthDate?.coordinates)
      selectCity(currentProfile?.birthDate?.coordinates);

    if (transitsFormData?.profile?.birthDate?.coordinates)
      selectCity(transitsFormData.profile.birthDate.coordinates);

    const date = transitsFormData? transitsFormData.profile.birthDate : currentProfile.birthDate;
    try {
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: { ...date, houseSystem },
          transitsDate,
        }),
      });

      // console.log(data);

      updateBirthChart({
        profileName: transitsFormData? transitsFormData.profile.name : currentProfile?.name,
        chartData: {
          ...data,
          birthDate: date
        },
        transits: data.transits,
        chartType: "transits",
      });
    }
    catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    } finally {
      setTransitsMenu(0);
      addChartMenu("transits");
      updateChartMenuDirectly("transits");
      setLoading(false);
    }
  };

  const makeSinastryCharts = async () => {
    setLoading(true);

    if (!currentProfile) {
      setLoading(false);
      return;
    }

    if (currentProfile?.birthDate?.coordinates)
      selectCity(currentProfile?.birthDate?.coordinates);

    try {
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: currentProfile?.birthDate,
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
        profileName: currentProfile?.name,
        chartData: {
          ...data,
          birthDate: currentProfile?.birthDate,
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
    if (menu === "home") return isMobileBreakPoint()? t("home.subtitleMobile") : t("home.subtitle");
    else if (menu === "birthChart")
      return isMobileBreakPoint() ? t("birthChart.titleMobile") : t("birthChart.title");
    else if (menu === "solarReturn")
      return t("returnChart.title");
    else if (menu === "lunarReturn")
      return t("returnChart.titleLunar");
    else if (menu === "sinastry")
      return t("synastryChart.title");
    else if (menu === "secondaryProgressions") return t("secondaryProgressions.title");
    else if (menu === "profection") return t("profections.title");
    else if (menu === "momentMap") return t("momentChart.title");
    else if (menu === "transits") return !isMobileBreakPoint()? t("transitsChart.title") : t("transitsChart.titleMobile");

    return "Sem título";
  }

  async function makeSecondaryProgression() {
    let birthDate = currentProfile?.birthDate;
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
        profileName: currentProfile?.name,
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

  function makeProfection() {
    setLoading(true);

    if (!birthChart) {
      setLoading(false);
      return;
    }

    const profectedChart = getProfectionChart(birthChart, profectionYear || 0);

    updateBirthChart({
      chartData: {
        ...profectedChart,
      },
      profileName: currentProfile?.name,
      chartType: "profection",
    });

    const chartType: ChartMenuType = "profection";
    addChartMenu(chartType);
    updateChartMenuDirectly(chartType);
    setLoading(false);
    setProfectionYear(undefined);
  }

  function _getDebugData(): JSX.Element {
    return (
      <div className="h-fit text-center">
        <span className="font-bold text-xl">:: Debugging ::</span>

        <div className="flex flex-col text-start items-start mt-2 gap-1">
          <span>
            screenDimensions:{" "}
            <span className="font-bold text-blue-800">
              [w: {screenDimensions.width}px x h: {screenDimensions.height}px]
            </span>
          </span>
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
    if ((menu === "birthChart" || menu === "home" || menu === "transits") && birthChart) return true;
    if ((menu === "birthChart" || menu === "momentMap") && birthChart) return true;
    if ((menu === "solarReturn" || menu === "lunarReturn") && returnChart) return true;
    if (menu === "sinastry" && sinastryChart) return true;
    if (menu === "secondaryProgressions" && progressionChart && birthChart) return true;
    if (menu === "profection" && profectionChart && birthChart) return true;

    return false;
  }

  function getTransitsTitle(): React.ReactNode {
    return (
      <div className="flex flex-row items-center gap-1 text-[16px] min-w-0">
        <span className="flex-shrink-0 whitespace-nowrap">
          {!isMobileBreakPoint()? t("transitsChart.title") : t("transitsChart.titleMobile")}
        </span>

        <span
          className="min-w-0 flex-1 truncate"
          title={currentProfile?.name}
        >
          - {currentProfile?.name}
        </span>
      </div>
    );
  }

  const getInitialMenuContent = (): JSX.Element =>
    <Container className="w-[90%] sm:w-1/4">
      <h2 className="text-[1rem] sm:text-lg text-center sm:text-start pt-4 px-2 sm:pt-0 sm:mb-4 font-bold">
        {getTitleMenuTitle()}
      </h2>

      <div className="w-full p-4 sm:p-0 flex flex-col gap-3">
        {menu === "home" && (
          <div className="w-full flex flex-col gap-2">
            <button
              className="default-btn"
              onClick={() => setMenu("birthChart")}
            >
              {t("home.birthChart")}
              <Image src="horoscope.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("solarReturn")}
            >
              {t("home.solarReturn")}
              <Image src="sun.png" width={iconSize - 2} height={iconSize - 2} unoptimized alt="chart"/>
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("lunarReturn")}
            >
              {t("home.lunarReturn")}
              <Image src="moon.png" width={iconSize - 2} height={iconSize - 2} unoptimized alt="chart"/>
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("transits")}
            >
              {t("birthChart.transits")}
              <Image src="planets/transits/mercury.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("sinastry")}
            >
              {t("home.sinastry")}
              <Image src="heart.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("secondaryProgressions")}
            >
              {t("home.secondaryProgressions")}
              <Image src="fast-forward.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("profection")}
            >
              {t("home.profections")}
              <Image src="profection.png" width={iconSize + 2} height={iconSize + 2} unoptimized alt="chart"/>
            </button>            
          </div>
        )}

        {menu === "birthChart" && (
          <BirthChartForm
            currentBirthDate={currentProfile?.birthDate}
            onSubmit={(profile) => getBirthChart(profile)}
          />
        )}

        {menu === "solarReturn" && (
          <>
            <PresavedChartsDropdown
              onChange={(profile) => updateCurrentSelectedProfile(profile)}
            />
            <form
              ref={solarReturnForm}
              className="w-full flex flex-col items-center gap-3"
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
                className="default-input-field w-full p-1"
                placeholder={t("returnChart.inputPlaceholder")}
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
                className="default-btn w-full"
              >
                {t("home.solarReturn")} 
                <Image src="sun.png" width={iconSize - 2} height={iconSize - 2} unoptimized alt="chart"/>
              </button>
            </form>
          </>
        )}

        {menu === "lunarReturn" && (
          <>
            <PresavedChartsDropdown
              onChange={(newProfile) => updateCurrentSelectedProfile(newProfile)}
            />
            <form
              ref={lunarReturnForm}
              className="w-full flex flex-col justify-between gap-3"
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
                  className="default-input-field w-1/3 px-1"
                  placeholder={t("form.day")}
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
                  className="default-input-field w-1/2"
                  value={lunarMonth}
                  onChange={(e) =>
                    setLunarMonth(Number.parseInt(e.target.value))
                  }
                >
                  {monthsNames.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {t(`months.${index + 1}`)}
                    </option>
                  ))}
                </select>

                <input
                  required
                  type="number"
                  className="default-input-field w-20 p-1"
                  placeholder={t("form.year")}
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
                {t("home.lunarReturn")}
                <Image src="moon.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
              </button>
            </form>
          </>
        )}

        {menu === "sinastry" && (
          <>
            <div className="flex flex-col gap-1">
              <span>{t("synastryChart.firstChart")}:</span>
              <PresavedChartsDropdown
                onChange={(profile) => updateCurrentSelectedProfile(profile)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span>{t("synastryChart.secondChart")}:</span>
              <PresavedChartsDropdown
                onChange={(profile) => setSinastryProfile(profile)}
              />
            </div>

            <button
              onClick={() => makeSinastryCharts()}
              className="default-btn"
            >
              {t("synastryChart.makeSynastry")}
              <Image src="heart.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
            </button>
          </>
        )}

        {menu === "home" && (
          <button
            onClick={() => setMenu("momentMap")}
            className="default-btn"
          >
            {t("home.momentChart")}
            <Image src="clock.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
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
            <span>{t("home.selectChart")}:</span>
            <PresavedChartsDropdown
              onChange={(profile) => updateCurrentSelectedProfile(profile)}
            />

            <div className="flex flex-row items-center gap-2">
              <label className="text-nowrap">{t("home.numOfYears")}:</label>
              <input
                required
                type="number"
                placeholder="ex: 30"
                className="w-full default-input-field p-1"
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
              {t("secondaryProgressions.generateProgression")}
              <Image src="fast-forward.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
            </button>
          </form>
        )}

        {menu === "profection" && (
          <form
            ref={profectionForm}
            className="w-full flex flex-col justify-between gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              getBirthChart();
            }}
          >
            <span>{t("home.selectChart")}:</span>
            <PresavedChartsDropdown
              onChange={(profile) => updateCurrentSelectedProfile(profile)}
            />

            <div className="flex flex-row items-center gap-2">
              <label className="text-nowrap">{t("home.numOfYears")}:</label>
              <input
                required
                type="number"
                placeholder="ex: 30"
                className="w-full default-input-field p-1"
                value={profectionYear ?? ""}
                onChange={(e) => {
                  const parsed = Number.parseInt(e.target.value);
                  if (Number.isNaN(parsed)) {
                    setProfectionYear(undefined);
                    return;
                  }

                  let val = parsed;
                  if (val < 0) val = 0;
                  setProfectionYear(val);
                }}
              />
            </div>

            <button
              type="submit"
              className="default-btn"
            >
              {t("profections.generateProfection")}
              <Image src="profection.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
            </button>
          </form>
        )}

        {menu === "momentMap" && (
          <>
            <CitySearch
              onSelect={selectCity}
            />
            <HouseSystemDropdown />
            <button
              className="default-btn"
              onClick={() => getMomentBirthChart()}
            >
              {t("birthChart.createMomentChart")}
            </button>

          </>
        )}

        {
          menu === "transits" && (
            <>
              <div className="w-full flex flex-row justify-between md:justify-start md:gap-4">
                <label htmlFor="load" className="gap-2 flex flex-row">
                  <input
                    type="radio"
                    id="load"
                    name="group"
                    value={0}
                    defaultChecked={profiles.length > 0}
                    disabled={profiles.length === 0}
                    onChange={() => setTransitsMenu(0)}
                  />
                  {t("transitsChart.momentTransits")}
                </label>

                <label
                  htmlFor="create"
                  className="gap-2 flex flex-row items-center justify-end"
                >
                  <input
                    type="radio"
                    id="create"
                    name="group"
                    value={1}
                    defaultChecked={profiles.length === 0}
                    onChange={() => setTransitsMenu(1)}
                  />
                  {t("transitsChart.calculateTransits")}
                </label>
              </div>

              {transitsMenu === 0 && 
                <>
                  <PresavedChartsDropdown
                    onChange={(profile) => updateCurrentSelectedProfile(profile)}
                  />
                  <HouseSystemDropdown />
                  <button
                    className="default-btn"
                    onClick={() => getChartWithTransits()}
                  >
                    {t("birthChart.createMomentChart")}
                    <Image src="/planets/transits/mercury.png" width={22} height={22} unoptimized alt="chart"/>
                  </button>
                </>
              }
              
              {transitsMenu === 1 && <TransitsChartForm onSubmit={(formData) => getChartWithTransits(formData)}/>}
            </>
          )
        }

        {/* Back btn */}
        {menu !== "home" && (
          <button
            className="default-btn"
            onClick={() => {
              setMenu("home");
              setTransitsMenu(0);
            }}
          >
            {t("form.back")}
            <Image src="back.png" width={iconSize} height={iconSize} unoptimized alt="chart"/>
          </button>
        )}

        <span
          className={`w-full text-start flex flex-row items-center justify-center gap-3 mt-2 ${loading ? "opacity-100" : "opacity-0"
            }`}
        >
          <Spinner />
          <span>{t("home.loading")}</span>
        </span>
      </div>
    </Container>

  const getChartContent = (): JSX.Element | null => {
    // console.log('gender to be rendered: ', currentProfile?.gender);
    
    switch (activeChart) {
      case "birth":
      case "moment":
        return birthChart ? <div className="w-full flex flex-col items-center">
          <div className="w-full text-left flex flex-col items-center mb-4">
            <ChartAndData
              arabicParts={arabicParts}
              title={chartMenu === "moment" ? t("momentChart.title") :
                `${t("birthChart.chartTitle")}${profileName}`}
              innerChart={birthChart}
              chartDateProps={{
                chartType: "birth",
                birthChart,
                chartDate: birthChart.birthDate,
              }}
              gender={currentProfile?.gender}
            />
          </div>
        </div> : null;

      case "transits":
        return birthChart ? <div className="w-full flex flex-col items-center">
          <div className="w-full text-left flex flex-col items-center mb-4">
            <ChartAndData
              arabicParts={arabicParts}
              title={getTransitsTitle()}
              innerChart={birthChart}
              chartDateProps={{
                chartType: "transits",
                birthChart,
                chartDate: birthChart.birthDate
              }}
              gender={currentProfile?.gender}
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
            gender={currentProfile?.gender}
            genderSinastry={sinastryProfile?.gender}
          />
        ) : null;

      case "progression":
        return <SecondaryProgressionChart />;

      case "profection":
        return <ProfectionChart />;

      default: return null;
    }
  }

  if (!isClientReady) {
    return <Container className="w-[90%] md:w-1/4 h-[416px] md:h-[428px] flex flex-col items-center justify-center space-y-3 ">
      <Spinner size="16" />
      <span className="pl-5">{t("home.loading")}</span>
    </Container>
  }

  return (
    <div className="w-[98vw] min-h-[50vh] md:mt-2 flex flex-col items-center justify-center gap-2">
      {/* <h3 className="font-bold">:: Test Mode ::</h3> */}
      {!canRenderChart() ? getInitialMenuContent() :
        <>
          {isTransitioning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`absolute w-screen md:w-full h-full top-0 md:top-auto md:h-[108%] px-3 md:px-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-10 
                  md:rounded-2xl transition-all duration-200 ease-in-out opacity-0 animate-[fadeIn_0.2s_forwards]`}
              >
                <Spinner size="16" />
                <h2 className="font-bold text-lg pl-10 mt-3">{t("home.loading")}</h2>
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
