"use client";

import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { ArabicPart, ArabicParts } from "@/interfaces/ArabicPartInterfaces";
import { useEffect, useRef, useState } from "react";
import {
  arabicPartKeys,
  convertDegMinNumberToDecimal,
} from "../utils/chartUtils";

export default function BirthArchArabicParts() {
  const { birthChart, returnChart } = useBirthChart();
  const { arabicParts, archArabicParts, updateArchArabicParts } =
    useArabicParts();
  const { calculateBirthArchArabicPart } = useArabicPartCalculations();
  const [parts, setParts] = useState<ArabicPart[]>([]);

  const [customAscendant, setCustomAscendant] = useState<number | undefined>(
    undefined
  );

  const lots: ArabicParts = {};

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
      const part = archArabicParts[key];

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

      <div>
        <h3 className="text-lg font-bold">Personalizar Ascendente:</h3>
        <input
          type="number"
          className="border-2 rounded-sm w-1/2 px-1"
          placeholder="Graus.Minutos, ex: 290.37"
          onChange={(e) => {
            const value = convertDegMinNumberToDecimal(
              Number.parseFloat(e.target.value)
            );
            setCustomAscendant(value > 0 ? value : undefined);
          }}
        />
      </div>
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
