import { apiFetch } from "@/app/utils/api";
import {
  convertDegMinToDecimal,
  makeLunarDerivedChart,
  monthsNames,
} from "@/app/utils/chartUtils";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";

import {
  BirthDate,
} from "@/interfaces/BirthChartInterfaces";
import moment from "moment";
import Image from "next/image";
import React, { useState } from "react";
import Spinner from "../Spinner";

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

  const makeChart = async () => {
    if (birthChart === undefined) return;

    setLoading(true);
    updateSolarReturnParts(archArabicParts);

    const returnDate = moment.tz(birthChart.returnTime, birthChart.timezone!);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate,
        targetDate,
      }),
    });

    const lunarDerivedChart = makeLunarDerivedChart(data, birthDate, targetDate);
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
    <div className="absolute w-[20rem] h-[12rem] border-2 rounded-md bg-white flex flex-col py-1 items-center justify-start z-50 gap-2">
      <header className="relative w-full flex flex-row items-center justify-center border-b-2">
        <h1 className="font-bold text-lg">Retorno Lunar Derivado</h1>
        <button
          className="absolute right-1 flex flex-row items-center justify-center"
          onClick={() => {
            onClose?.();
          }}
        >
          <div className="absolute w-[19px] h-[19px] hover:opacity-20 hover:bg-gray-400 active:bg-gray-900" />
          <Image
            alt="close"
            src="/close.png"
            width={25}
            height={25}
            unoptimized
          />
        </button>
      </header>

      <form
        className="w-full flex flex-col gap-2 h-1/2 mt-0 px-2"
        onSubmit={(e) => {
          e.preventDefault();
          makeChart();
        }}
      >
        <div className="w-full flex flex-row items-center justify-center gap-2">
          <input
            type="number"
            className="border-2 w-16 p-1 rounded-sm"
            placeholder="Dia"
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
            className="border-2 w-full h-full rounded-sm"
            onChange={(e) => setMonth(Number.parseInt(e.target.value) + 1)}
            required
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

        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <button
            type="submit"
            className="default-btn"
          // onClick={() => {
          //   makeChart();
          // }}
          >
            Gerar Mapa
          </button>

          <span
            className={`w-full text-start flex flex-row items-center justify-center gap-3 mt-2 ${loading ? "opacity-100" : "opacity-0"
              }`}
          >
            <Spinner />
            <span>Carregando...</span>
          </span>
        </div>
      </form>
    </div>
  );
}
