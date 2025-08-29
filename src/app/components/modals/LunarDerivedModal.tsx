import {
  arabicPartKeys,
  convertDegMinToDecimal,
  decimalToDegreesMinutes,
  getAntiscion,
  getDegreeAndSign,
  monthsNames,
} from "@/app/utils/chartUtils";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import {
  BirthChart,
  BirthDate,
  Planet,
  planetTypes,
} from "@/interfaces/BirthChartInterfaces";
import moment from "moment";
import React, { useEffect, useState } from "react";

interface LunarModalProps {
  onClose?: () => void;
}

const getGlyphOnly = true;

export default function LunarDerivedModal(props: LunarModalProps) {
  const { onClose } = props;
  const { birthChart, returnChart, updateBirthChart } = useBirthChart();

  const [lunarChart, setLunarChart] = useState<BirthChart | undefined>();
  const [day, setDay] = useState(0);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(0);
  const [renderChart, setRenderChart] = useState(false);
  const [parts, setParts] = useState<ArabicPartsType>({});
  const [returnTime, setReturnTime] = useState("");

  const makeChart = async () => {
    if (birthChart === undefined) return;

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

    const response = await fetch("http://localhost:3001/return/lunar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate,
        targetDate,
      }),
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(`Erro ao buscar a Revolução Lunar Derivada.`);
    }

    const data = await response.json();

    setLunarChart({
      ...data,
      returnTime: data.returnTime,
      birthDate,
      targetDate,
      planets: data.returnPlanets.map((planet: Planet) => {
        return {
          ...planet,
          longitude: decimalToDegreesMinutes(planet.longitude),
          antiscion: getAntiscion(planet.longitude),

          longitudeRaw: planet.longitude,
          antiscionRaw: getAntiscion(planet.longitude, true),
          type: planetTypes[planet.id],
        };
      }),
      planetsWithSigns: data.returnPlanets.map((planet: Planet) => {
        return {
          position: getDegreeAndSign(
            decimalToDegreesMinutes(planet.longitude),
            getGlyphOnly
          ),
          antiscion: getDegreeAndSign(
            getAntiscion(planet.longitude),
            getGlyphOnly
          ),
        };
      }),
      housesData: {
        ...data?.returnHousesData,
        housesWithSigns: data.returnHousesData?.house.map(
          (houseLong: number) => {
            return getDegreeAndSign(
              decimalToDegreesMinutes(houseLong),
              getGlyphOnly
            );
          }
        ),
      },
    });
  };

  return (
    <div className="absolute w-[20rem] h-[10rem] border-2 rounded-md bg-white flex flex-col items-center justify-center p-2 z-10">
      <header className="relative w-full flex flex-row items-center justify-center">
        <h1 className="font-bold text-lg">Retorno Lunar Derivado</h1>
        <button
          className="absolute right-0 flex flex-row items-center justify-center"
          onClick={() => {
            onClose?.();
          }}
        >
          <div className="absolute w-[21px] h-[21px] hover:opacity-20 hover:bg-gray-400 active:bg-gray-900" />
          <img src="close.png" width={25} />
        </button>
      </header>

      <form
        className="w-full flex flex-col gap-2 h-1/2 mt-2"
        onSubmit={(e) => {
          e.preventDefault();
          setRenderChart(false);
          makeChart();
        }}
      >
        <div className="w-full flex flex-row items-center justify-center gap-2">
          <input
            type="number"
            className="border-2 w-16 p-1 rounded-sm"
            placeholder="Dia"
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
                setYear(val);
                e.target.value = val.toString();
              }
            }}
          />
        </div>

        <div className="w-full flex flex-row items-center justify-center gap-2">
          <button
            type="submit"
            className="w-full bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
            onClick={() => {
              setRenderChart(false);
              makeChart();
            }}
          >
            Gerar Mapa
          </button>
        </div>
      </form>
    </div>
  );
}
