"use client";
import { useEffect, useRef } from "react";
import moment from "moment";
import { ChartQuery, extractBirthDate } from "@/utils/chartUrl";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import { apiFetch } from "@/app/utils/api";
import { convertDegMinToDecimal, getProfectionChart, makeLunarDerivedChart } from "@/app/utils/chartUtils";
import type { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useTranslations } from "next-intl";
import ChartAndData from "./ChartAndData";
import ReturnChart from "./charts/ReturnChart";
import LunarDerivedChart from "./charts/LunarDerivedChart";
import SinastryChart from "./charts/SinastryChart";
import SecondaryProgressionChart from "./charts/SecondaryProgressionChart";
import ProfectionChart from "./charts/ProfectionChart";
import TransitsChart from "./charts/TransitsChart";

export default function ChartRuntime({ query }: { query: ChartQuery }) {
  const { addChartMenu, updateChartMenuDirectly } = useChartMenu();
  const { updateCurrentSelectedProfile } = useProfiles();
  const {
    birthChart, returnChart, lunarDerivedChart, sinastryChart, progressionChart, profectionChart,
    updateBirthChart, updateLunarDerivedChart, profileName, updateLoadingNextChart,
  } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const t = useTranslations();

  const transitsRawDataRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      updateLoadingNextChart(true);
      try {
        switch (query.type) {
          case "birth":
          case "moment": {
            const birthDate = extractBirthDate(query, "birth", query.houseSystem);
            updateCurrentSelectedProfile({
              name: query.type === "moment" ? undefined : query.profileName,
              gender: query.type === "moment" ? "event" : query.gender,
              birthDate,
            });
            const data = await apiFetch("birth-chart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ birthDate }),
            });
            updateBirthChart({
              profileName: query.type === "moment" ? t("home.momentChart") : query.profileName,
              chartData: { ...data, birthDate },
              chartType: "birth",
            });
            break;
          }

          case "transits": {
            const birthDate = extractBirthDate(query, "birth", query.houseSystem);
            const transitsDate = extractBirthDate(query, "transits");
            updateCurrentSelectedProfile({ name: query.profileName, gender: query.gender, birthDate });
            const data = await apiFetch("birth-chart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ birthDate, transitsDate }),
            });
            transitsRawDataRef.current = { ...data, birthDate }; // <- guarda o payload cru
            updateBirthChart({
              profileName: query.profileName,
              chartData: { ...data, birthDate },
              transits: data.transits,
              chartType: "transits",
            });
            break;
          }

          case "solarReturn":
          case "lunarReturn": {
            const birthDate = extractBirthDate(query, "birth");
            updateCurrentSelectedProfile({ name: query.profileName, gender: query.gender, birthDate }); // <- estava faltando
            const returnType = query.type === "solarReturn" ? "solar" : "lunar";
            const targetDate: BirthDate = {
              ...birthDate,
              day: query.type === "lunarReturn" ? query.targetDay : birthDate.day,
              month: query.type === "lunarReturn" ? query.targetMonth : birthDate.month,
              year: query.targetYear,
            };

            const data = await apiFetch(`return/${returnType}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ birthDate, targetDate }),
            });

            updateBirthChart({ chartType: "birth", profileName: query.profileName, chartData: { ...data, birthDate, targetDate } });
            updateBirthChart({
              chartType: "return",
              chartData: {
                planets: data.returnPlanets,
                housesData: data.returnHousesData,
                returnType,
                birthDate,
                targetDate,
                returnTime: data.returnTime,
                fixedStars: data.fixedStars,
                timezone: data.timezone,
              },
            });
            break;
          }

          case "lunarDerivedReturn": {
            const birthDate = extractBirthDate(query, "birth");
            updateCurrentSelectedProfile({ name: query.profileName, gender: query.gender, birthDate });
            const solarTargetDate: BirthDate = { ...birthDate, year: query.solarTargetYear };

            const solarData = await apiFetch("return/solar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ birthDate, targetDate: solarTargetDate }),
            });

            updateBirthChart({ chartType: "birth", profileName: query.profileName, chartData: { ...solarData, birthDate, targetDate: solarTargetDate } });
            updateBirthChart({
              chartType: "return",
              chartData: {
                planets: solarData.returnPlanets,
                housesData: solarData.returnHousesData,
                returnType: "solar",
                birthDate,
                targetDate: solarTargetDate,
                returnTime: solarData.returnTime,
                fixedStars: solarData.fixedStars,
                timezone: solarData.timezone,
              },
            });

            const returnMoment = moment.tz(solarData.returnTime, solarData.timezone);
            const [h, m] = returnMoment.format("HH:mm").split(":").map(Number);

            const derivedBirthDate: BirthDate = {
              day: returnMoment.date(),
              month: returnMoment.month() + 1,
              year: returnMoment.year(),
              time: convertDegMinToDecimal(h, m).toString(),
              coordinates: { ...birthDate.coordinates },
            };
            const derivedTargetDate: BirthDate = {
              day: query.derivedDay,
              month: query.derivedMonth,
              year: query.derivedYear,
              time: birthDate.time,
              coordinates: birthDate.coordinates,
            };

            const lunarData = await apiFetch("return/lunar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ birthDate: derivedBirthDate, targetDate: derivedTargetDate }),
            });

            updateLunarDerivedChart(makeLunarDerivedChart(lunarData, derivedBirthDate, derivedTargetDate));
            break;
          }

          case "sinastry": {
            const birthDate1 = extractBirthDate(query, "p1");
            const birthDate2 = extractBirthDate(query, "p2");
            updateCurrentSelectedProfile({ name: query.profile1Name, gender: query.gender1, birthDate: birthDate1 });

            const data1 = await apiFetch("birth-chart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ birthDate: birthDate1 }) });
            const data2 = await apiFetch("birth-chart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ birthDate: birthDate2 }) });

            updateBirthChart({ profileName: query.profile1Name, chartData: { ...data1, birthDate: birthDate1 }, chartType: "birth" });
            updateBirthChart({ chartData: { ...data2, birthDate: birthDate2 }, chartType: "sinastry" });
            break;
          }

          case "progression": {
            const birthDate = extractBirthDate(query, "birth");
            updateCurrentSelectedProfile({ name: query.profileName, gender: query.gender, birthDate }); // <- estava faltando

            const natalData = await apiFetch("birth-chart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ birthDate }) });
            updateBirthChart({ profileName: query.profileName, chartData: { ...natalData, birthDate }, chartType: "birth" });

            const jsDate = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
            jsDate.setDate(jsDate.getDate() + query.years);
            const progressedBirthDate: BirthDate = { ...birthDate, day: jsDate.getDate(), month: jsDate.getMonth() + 1, year: jsDate.getFullYear() };

            const data = await apiFetch("birth-chart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ birthDate: progressedBirthDate }) });
            updateBirthChart({ profileName: query.profileName, chartData: { ...data, birthDate: progressedBirthDate }, chartType: "progression" });
            break;
          }

          case "profection": {
            const birthDate = extractBirthDate(query, "birth");
            updateCurrentSelectedProfile({ name: query.profileName, gender: query.gender, birthDate });
            const data = await apiFetch("birth-chart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ birthDate }) });
            updateBirthChart({ profileName: query.profileName, chartData: { ...data, birthDate }, chartType: "birth" });
            break;
          }
        }
      } finally {
        updateLoadingNextChart(false);
      }
    })();

    addChartMenu(query.type);
    updateChartMenuDirectly(query.type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)]);

  useEffect(() => {
    if (query.type === "profection" && birthChart) {
      const profectedChart = getProfectionChart(birthChart, query.years);
      updateBirthChart({ chartData: { ...profectedChart }, profileName: query.profileName, chartType: "profection" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthChart, query.type]);

  switch (query.type) {
    case "birth":
    case "moment":
      return birthChart ? (
        <ChartAndData
          arabicParts={arabicParts}
          title={query.type === "moment" ? t("momentChart.title") : `${t("birthChart.chartTitle")}${profileName}`}
          innerChart={birthChart}
          chartDateProps={{ chartType: "birth", birthChart, chartDate: birthChart.birthDate }}
          gender={query.type === "moment" ? "event" : query.gender}
        />
      ) : null;

    case "transits":
      return birthChart && transitsRawDataRef.current ? (
        <TransitsChart
          rawData={transitsRawDataRef.current}
          profileName={query.profileName}
          gender={query.gender}
        />
      ) : null;

    case "solarReturn":
    case "lunarReturn":
      return returnChart ? <ReturnChart /> : null;

    case "lunarDerivedReturn":
      return lunarDerivedChart && archArabicParts && arabicParts ? <LunarDerivedChart /> : null;

    case "sinastry":
      return sinastryChart ? (
        <SinastryChart
          sinastryChart={sinastryChart}
          sinastryProfileName={query.profile2Name}
          gender={query.gender1}
          genderSinastry={query.gender2}
        />
      ) : null;

    case "progression":
      return progressionChart ? <SecondaryProgressionChart /> : null;

    case "profection":
      return profectionChart ? <ProfectionChart /> : null;

    default:
      return null;
  }
}