import {
  allSigns,
  clampLongitude,
  convertDegMinNumberToDecimal,
  decimalToDegreesMinutes,
  getDegreesInsideASign,
} from "@/app/utils/chartUtils";
import React, { useEffect, useRef, useState } from "react";
import ArabicPartsLayout from "./ArabicPartsLayout";
import { ArabicPart } from "@/interfaces/ArabicPartInterfaces";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { calculateBirthArchArabicPart } from "@/app/utils/arabicPartsUtils";

interface ASCModalProps {
  baseParts?: ArabicPart[];
}

export default function CustomizeASC(props: ASCModalProps) {
  const { baseParts } = props;
  const { birthChart } = useBirthChart();

  const [calculatedParts] = useState<ArabicPart[] | undefined>(undefined);
  const [partsToUse, setPartsToUse] = useState<ArabicPart[] | undefined>(
    calculatedParts ?? baseParts
  );
  const [signIndex, setSignIndex] = useState(0);
  const [customACMode, setCustomACMode] = useState(0);
  const [customAscendant, setCustomAscendant] = useState<number | undefined>(
    undefined
  );

  const firstModeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!customAscendant && birthChart) {
      setCustomAscendant(birthChart.housesData.ascendant);
      if (firstModeInputRef.current !== null) {
        firstModeInputRef.current.value = decimalToDegreesMinutes(
          getDegreesInsideASign(birthChart.housesData.house[0])
        ).toString();

        const newSignIndex = Math.floor(birthChart.housesData.ascendant / 30);
        setSignIndex(newSignIndex);
      }
    }
  }, []);

  useEffect(() => {
    if (!birthChart) return;

    const asc = customAscendant ?? birthChart.housesData.ascendant;
    const newParts = (baseParts ?? []).map((part) =>
      calculateBirthArchArabicPart(part, asc)
    );

    setPartsToUse(newParts);
  }, [customAscendant, birthChart, baseParts]);

  return (
    <div className="w-full flex flex-col items-center justify-between">

      <div className="w-full flex flex-row">
        <select
          className="mr-4 border-2 rounded-sm text-sm bg-white"
          onChange={(e) => {
            const val = Number.parseInt(e.target.value);
            setCustomACMode(val);
          }}
        >
          <option value={0}>Por Signo</option>
          <option value={1}>Por Grau</option>
        </select>

        {customACMode === 0 && (
          <div className="flex flex-row gap-2 text-sm">
            <select
              value={signIndex}
              className="border-2 rounded-sm bg-white"
              onChange={(e) => {
                const newSignIndex = Number.parseInt(e.target.value);
                setSignIndex(newSignIndex);
                const long = convertDegMinNumberToDecimal(
                  Number.parseFloat(
                    firstModeInputRef.current?.value ?? "0.0"
                  )
                );
                const value = newSignIndex * 30 + long;
                setCustomAscendant(value > 0 ? value : 0);
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
              ref={firstModeInputRef}
              type="number"
              className="border-2 rounded-sm w-full md:w-[120px] p-1 text-sm bg-white"
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
                setCustomAscendant(value > 0 ? value : 0);
              }}
            />
          </div>
        )}

        {customACMode === 1 && (
          <input
            type="number"
            className="border-2 rounded-sm w-[120px] p-1 text-sm"
            placeholder="ex: 290.37"
            onChange={(e) => {
              const convertedString = clampLongitude(e.target.value, 360);
              e.target.value =
                e.target.value.length > 0
                  ? convertedString.toString()
                  : e.target.value;
              const value = convertDegMinNumberToDecimal(convertedString);
              setCustomAscendant(value > 0 ? value : 0);
            }}
          />
        )}
      </div>

      <div className="w-full flex flex-col items-start mt-4">
        <ArabicPartsLayout
          showSwitchParts={false}
          parts={partsToUse}
          title="Partes Árabes*"
          showMenuButtons={false}
        />
      </div>

      <span className="w-full text-sm italic h-full flex flex-row items-center mt-2">
        *Baseadas no Ascendente do Mapa Natal.
      </span>

    </div>
  );
}
