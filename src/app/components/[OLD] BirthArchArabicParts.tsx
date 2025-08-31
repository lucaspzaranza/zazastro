"use client";

import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useEffect, useRef, useState } from "react";
import {
  allSigns,
  arabicPartKeys,
  clampLongitude,
  convertDegMinNumberToDecimal,
  formatSignColor,
  getArabicPartImage,
} from "../utils/chartUtils";

export default function BirthArchArabicParts({
  customArabicParts,
  useCustomASCControls,
}: {
  customArabicParts?: ArabicPartsType;
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

  const lots: ArabicPartsType = {};

  useEffect(() => {
    if (arabicParts === undefined) return;

    updateArchArabicParts({});

    arabicPartKeys.forEach((key) => {
      const part = arabicParts[key];
      if (part && returnChart) {
        const newArchArabicPart = calculateBirthArchArabicPart(
          part,
          customAscendant ?? returnChart.housesData.ascendant
        );
        lots[key] = newArchArabicPart;
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
    <div className="w-full flex flex-col gap-2">
      <h2 className="text-xl font-bold mt-[-5px]">
        Partes Árabes Por Arco&nbsp;
        {returnChart?.returnType === "solar" ? "Solar" : "Lunar"}:
      </h2>

      {/* {useCustomASCControls && (
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
      )} */}

      <ul>
        {parts.map((arabicPart, index) => {
          return (
            <li key={index} className="flex flex-row items-center">
              <div className="w-full flex flex-row">
                <span className="w-[14rem] flex flex-row items-center ">
                  {arabicPart?.name}&nbsp;{getArabicPartImage(arabicPart)}:
                  <span className="w-full text-end pr-3">
                    {formatSignColor(arabicPart.longitudeSign)}
                  </span>
                </span>
                <span className="w-[12rem] flex flex-row items-center pl-2">
                  Antiscion:&nbsp;
                  <span className="w-full text-end">
                    {formatSignColor(arabicPart.antiscionSign)}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
