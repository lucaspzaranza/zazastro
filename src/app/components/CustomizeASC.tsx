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

  const ascInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!customAscendant && birthChart) {
      setCustomAscendant(birthChart.housesData.ascendant);
      if (ascInputRef.current !== null) {
        ascInputRef.current.value = decimalToDegreesMinutes(
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

  function calculateCustomASC() {
    const rawValue = ascInputRef.current?.value ?? "0.0";

    if (customACMode === 0) {
      const convertedString = clampLongitude(rawValue, 29);
      const longitude =
        convertDegMinNumberToDecimal(convertedString);
      const value = signIndex * 30 + longitude;
      setCustomAscendant(value > 0 ? value : undefined);
    } else if (customACMode === 1) {
      const convertedString = clampLongitude(rawValue, 360);
      const value = convertDegMinNumberToDecimal(convertedString);
      setCustomAscendant(value > 0 ? value : undefined);
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-between gap-2">
      <div className="w-full flex flex-row justify-between gap-2">
        <select
          className="border-2 rounded-sm text-sm bg-white"
          onChange={(e) => {
            const val = Number.parseInt(e.target.value);
            setCustomACMode(val);
          }}
        >
          <option value={0}>Por Signo</option>
          <option value={1}>Por Grau</option>
        </select>

        {customACMode === 0 && (
          <form className="w-full flex flex-row gap-2 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              calculateCustomASC();
            }}>
            <div className="w-full flex flex-row gap-2">
              <select
                value={signIndex}
                className="border-2 w-full rounded-sm bg-white"
                onChange={(e) => {
                  const newSignIndex = Number.parseInt(e.target.value);
                  setSignIndex(newSignIndex);
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
                ref={ascInputRef}
                inputMode="decimal"
                // pattern="[0-9]*[.,]?[0-9]*"
                className="border-2 rounded-sm w-[5rem] md:w-[8rem] p-1 text-sm bg-white"
                placeholder="ex: 29.37"
                onChange={(e) => {
                  const convertedString = clampLongitude(e.target.value, 29);
                  if (isNaN(convertedString)) return;

                  e.target.value =
                    e.target.value.length > 0
                      ? convertedString.toString()
                      : e.target.value;
                }}
              />
            </div>
          </form>
        )}

        {customACMode === 1 && (
          <form className="w-full flex flex-row justify-start gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              calculateCustomASC();
            }}>
            <input
              ref={ascInputRef}
              inputMode="decimal"
              // pattern="[0-9]*[.,]?[0-9]*"
              className="border-2 rounded-sm w-full p-1 text-sm bg-white"
              placeholder="ex: 290.37"
              onChange={(e) => {
                const convertedString = clampLongitude(e.target.value, 360);
                if (isNaN(convertedString)) return;

                e.target.value =
                  e.target.value.length > 0
                    ? convertedString.toString()
                    : e.target.value;
              }}
            />
          </form>
        )}
      </div>

      <button className="default-btn w-full" onClick={calculateCustomASC}>
        Calcular
      </button>

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
