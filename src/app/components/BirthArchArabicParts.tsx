"use client";

import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import { ArabicPart, ArabicParts } from "@/interfaces/ArabicPart";
import { useEffect, useRef, useState } from "react";

export default function BirthArchArabicParts() {
  const { birthChart, returnChart } = useBirthChart();
  const { arabicParts } = useArabicParts();
  const { calculateBirthArchArabicPart } = useArabicPartCalculations();

  const [birthArchArabicParts, setBirthArchArabicParts] = useState<
    ArabicPart[]
  >([]);

  useEffect(() => {
    if (arabicParts === undefined) return;

    setBirthArchArabicParts([]);

    const keys: (keyof ArabicParts)[] = [
      "fortune",
      "spirit",
      "necessity",
      "love",
      "valor",
      "victory",
      "captivity",
      "marriage",
      "resignation",
    ];

    keys.forEach((key) => {
      const part = arabicParts[key];
      if (part && returnChart && !birthArchArabicParts.includes(part)) {
        // console.log(`Parte Árabe: ${key}`, part);
        const birthArchArabicPart = calculateBirthArchArabicPart(
          part,
          returnChart
        );
        setBirthArchArabicParts((prev) => [...prev, birthArchArabicPart]);
      }
    });
  }, [arabicParts]);

  if (birthArchArabicParts.length === 0) return;

  return (
    <div className="flex flex-col gap-2 mt-4 text-left">
      <h2 className="text-xl font-bold">
        Partes Árabes Por Arco Natal (
        {returnChart?.returnType === "solar" ? "Solar" : "Lunar"})
      </h2>
      <ul>
        {birthArchArabicParts.map((arabicPart, index) => {
          return (
            <li key={index}>
              {arabicPart?.name}: {arabicPart.longitudeSign}&nbsp; Antiscion:{" "}
              {arabicPart.antiscionSign}
            </li>
          );
        })}

        {/* 
          <li>
            {birthArchArabicParts?.fortune?.name}:{" "}
            {birthArchArabicParts.fortune?.longitudeSign}
            &nbsp; Antiscion: {birthArchArabicParts.fortune?.antiscionSign}
          </li>
         */}
      </ul>
    </div>
  );
}
