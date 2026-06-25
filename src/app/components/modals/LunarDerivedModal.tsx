import { apiFetch } from "@/app/utils/api";
import {
  convertDegMinToDecimal,
  makeLunarDerivedChart,
  monthsNames,
} from "@/app/utils/chartUtils";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthDate } from "@/interfaces/BirthChartInterfaces";
import moment from "moment";
import React, { useState } from "react";
import Spinner from "../Spinner";
import { useTranslations } from "next-intl";
import { IoClose } from "react-icons/io5";

interface LunarModalProps {
  onClose?: () => void;
}

export default function LunarDerivedModal(props: LunarModalProps) {
  const { onClose } = props;

  const { birthChart, updateLunarDerivedChart } = useBirthChart();

  const { archArabicParts, updateSolarReturnParts } = useArabicParts();

  const [day, setDay] = useState(0);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(0);

  const [loading, setLoading] = useState(false);

  const { isCombinedWithBirthChart, updateIsCombinedWithBirthChart } =
    useBirthChart();

  const t = useTranslations();

  const makeChart = async () => {
    if (birthChart === undefined) return;

    setLoading(true);

    updateSolarReturnParts(archArabicParts);

    const returnDate = moment.tz(
      birthChart.returnTime,
      birthChart.timezone!
    );

    const timeArrayString = returnDate.format("HH:mm").split(":");

    const time = [
      Number.parseInt(timeArrayString[0]),
      Number.parseInt(timeArrayString[1]),
    ];

    const birthDate: BirthDate = {
      day: returnDate.date(),
      month: returnDate.month() + 1,
      year: returnDate.year(),
      time: convertDegMinToDecimal(time[0], time[1]).toString(),
      coordinates: {
        ...birthChart.birthDate.coordinates,
      },
    };

    const targetDate: BirthDate = {
      year,
      month,
      day,
      time: birthChart.birthDate.time,
      coordinates: birthChart.birthDate.coordinates,
    };

    const data = await apiFetch("return/lunar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        birthDate,
        targetDate,
      }),
    });

    const lunarDerivedChart = makeLunarDerivedChart(
      data,
      birthDate,
      targetDate
    );

    updateLunarDerivedChart?.(lunarDerivedChart);

    setLoading(false);

    setTimeout(() => {
      if (isCombinedWithBirthChart) {
        updateIsCombinedWithBirthChart(false);
      }

      onClose?.();
    }, 100);
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center z-30 px-3">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => onClose?.()}
      />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        <header className="relative w-full px-5 py-4 flex flex-row items-center justify-center border-b border-zinc-100">
          <h1 className="font-bold text-xl tracking-tight text-zinc-800 text-center">
            {t("returnChart.lunarDerivedReturn")}
          </h1>

          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
            onClick={() => onClose?.()}
          >
            <IoClose size={22} />
          </button>
        </header>

        <div className="w-full px-5 py-5 bg-zinc-50">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              makeChart();
            }}
          >
            <div className="flex flex-row gap-2">
              <input
                type="number"
                className="w-16 md:w-20 border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                placeholder={t("form.day")}
                required
                onChange={(e) => {
                  if (e.target.value.length > 0) {
                    let val = Number.parseInt(e.target.value);

                    if (val < 1) val = 1;
                    if (val > 31) val = 31;

                    setDay(val);
                    e.target.value = val.toString();
                  }
                }}
              />

              <select
                className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                onChange={(e) =>
                  setMonth(Number.parseInt(e.target.value) + 1)
                }
                required
              >
                {monthsNames.map((month, index) => (
                  <option
                    key={index}
                    value={index}
                  >
                    {t(`months.${index + 1}`)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                className="w-20 border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                placeholder={t("form.year")}
                required
                onChange={(e) => {
                  if (e.target.value.length > 0) {
                    let val = Number.parseInt(e.target.value);

                    if (val < 0) val = 0;

                    setYear(val);
                    e.target.value = val.toString();
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="default-btn"
            >
              {t("birthChart.createMomentChart")}
            </button>

            <div
              className={`flex flex-row items-center justify-center gap-3 text-sm text-zinc-600 transition-opacity ${
                loading ? "opacity-100" : "opacity-0"
              }`}
            >
              <Spinner />
              <span>{t("home.loading")}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}