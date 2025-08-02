"use client";

import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { ArabicPart, ArabicParts } from "@/interfaces/ArabicPartInterfaces";
import { useEffect, useRef, useState } from "react";
import {
  allSigns,
  arabicPartKeys,
  convertDegMinNumberToDecimal,
} from "../utils/chartUtils";

export default function BirthArchArabicParts({
  customArabicParts,
  useCustomASCControls,
}: {
  customArabicParts?: ArabicParts;
  useCustomASCControls: boolean;
}) {
  const { birthChart, returnChart } = useBirthChart();
  const { arabicParts, archArabicParts, updateArchArabicParts } =
    useArabicParts();
  const { calculateBirthArchArabicPart } = useArabicPartCalculations();
  const [parts, setParts] = useState<ArabicPart[]>([]);
  const [customACMode, setCustomACMode] = useState(0);
  const [signIndex, setSignIndex] = useState(0);

  const [customAscendant, setCustomAscendant] = useState<number | undefined>(
    undefined
  );

  const lots: ArabicParts = {};

  const clampLongitude = (rawString: string, degthreshold: number): number => {
    if (rawString.length === 0) return 0;

    const deg = rawString.split(".")[0];
    const min = rawString.split(".")[1];

    let degNumber = deg === undefined ? 0 : Number.parseInt(deg);
    let minNumber = min === undefined ? 0 : Number.parseInt(min);

    if (degNumber < 0) degNumber = 0;
    else if (degNumber > degthreshold) degNumber = degthreshold;

    if (minNumber > 59) minNumber = 59;

    const result = degNumber + minNumber / 100;

    return result;
  };

  useEffect(() => {
    if (arabicParts === undefined) return;

    updateArchArabicParts({});

    arabicPartKeys.forEach((key) => {
      const part = arabicParts[key];
      if (part && returnChart) {
        // console.log(`Parte Árabe: ${key}`, part);
        const newArchArabicPart = calculateBirthArchArabicPart(
          part,
          customAscendant ?? returnChart.housesData.ascendant
        );
        lots[key] = newArchArabicPart;
        // console.log("updatedArabicParts:", result);
        updateArchArabicParts(lots);
      }
    });
  }, [arabicParts, customAscendant]);

  useEffect(() => {
    if (archArabicParts === undefined) return;
    setParts([]);

    arabicPartKeys.forEach((key) => {
      const part =
        customArabicParts === undefined
          ? archArabicParts[key]
          : customArabicParts[key];

      if (part) {
        setParts((prev) => [...prev, part]);
      }
    });
  }, [archArabicParts]);

  if (archArabicParts === undefined) return;

  return (
    <div className="w-full flex flex-col gap-2 mt-4">
      <h2 className="text-xl font-bold">
        Partes Árabes Por Arco Natal (
        {returnChart?.returnType === "solar" ? "Solar" : "Lunar"})
      </h2>

      {useCustomASCControls && (
        <div>
          <h3 className="text-lg font-bold">Personalizar Ascendente:</h3>
          <div className="flex flex-row">
            <select
              className="mr-4 border-2 rounded-sm"
              onChange={(e) => {
                const val = Number.parseInt(e.target.value);
                setCustomACMode(val);
              }}
            >
              <option value={0}>Por Signo</option>
              <option value={1}>Por Grau</option>
            </select>

            {customACMode === 0 && (
              <div className="flex flex-row gap-2">
                <select
                  className="border-2 rounded-sm"
                  onChange={(e) => {
                    setSignIndex(Number.parseInt(e.target.value));
                  }}
                >
                  {allSigns.map((sign, index) => {
                    return (
                      <option key={index} value={index}>
                        {sign}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="number"
                  className="border-2 rounded-sm w-[120px] px-1"
                  placeholder="ex: 29.37"
                  onChange={(e) => {
                    const convertedString = clampLongitude(e.target.value, 29);
                    e.target.value =
                      e.target.value.length > 0
                        ? convertedString.toString()
                        : e.target.value;
                    const longitude =
                      convertDegMinNumberToDecimal(convertedString);
                    const value = signIndex * 30 + longitude;
                    setCustomAscendant(value > 0 ? value : undefined);
                  }}
                />
              </div>
            )}

            {customACMode === 1 && (
              <input
                type="number"
                className="border-2 rounded-sm w-[120px] px-1"
                placeholder="ex: 290.37"
                onChange={(e) => {
                  const convertedString = clampLongitude(e.target.value, 360);
                  e.target.value =
                    e.target.value.length > 0
                      ? convertedString.toString()
                      : e.target.value;
                  const value = convertDegMinNumberToDecimal(convertedString);
                  setCustomAscendant(value > 0 ? value : undefined);
                }}
              />
            )}
          </div>
        </div>
      )}

      <ul>
        {/* {birthArchArabicParts.map((arabicPart, index) => { */}
        {parts.map((arabicPart, index) => {
          return (
            <li key={index}>
              {arabicPart?.name}: {arabicPart.longitudeSign}&nbsp; Antiscion:{" "}
              {arabicPart.antiscionSign}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
