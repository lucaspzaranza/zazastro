"use client";

import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import type {
  ArabicParts,
  ArabicPart,
} from "@/interfaces/ArabicPartInterfaces";
import { useEffect, useRef, useState } from "react";

export default function ArabicParts() {
  const { birthChart } = useBirthChart();
  const { arabicParts, updateArabicParts } = useArabicParts();
  const {
    calculateLotOfFortune,
    calculateLotOfSpirit,
    calculateLotOfNecessity,
    calculateLotOfLove,
    calculateLotOfValor,
    calculateLotOfVictory,
    calculateLotOfCaptivity,
    calculateLotOfMarriage,
    calculateLotOfResignation,
  } = useArabicPartCalculations();

  const [parts, setParts] = useState<ArabicPart[]>([]);

  useEffect(() => {
    if (birthChart === undefined) return;

    updateArabicParts({
      fortune: calculateLotOfFortune(birthChart),
      spirit: calculateLotOfSpirit(birthChart),
    });
  }, [birthChart]);

  useEffect(() => {
    if (birthChart === undefined) return;

    if (arabicParts?.fortune && arabicParts.spirit) {
      updateArabicParts({
        necessity: calculateLotOfNecessity(birthChart),
        love: calculateLotOfLove(birthChart),
      });
    }

    if (arabicParts?.fortune) {
      updateArabicParts({
        valor: calculateLotOfValor(birthChart),
        captivity: calculateLotOfCaptivity(birthChart),
      });
    }

    if (arabicParts?.spirit) {
      updateArabicParts({
        victory: calculateLotOfVictory(birthChart),
      });
    }

    // Custom Arabic Parts
    updateArabicParts({
      marriage: calculateLotOfMarriage(birthChart),
      resignation: calculateLotOfResignation(birthChart),
    });
  }, [arabicParts?.fortune]);

  useEffect(() => {
    if (arabicParts === undefined) return;
    setParts([]);

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

      if (part) {
        setParts((prev) => [...prev, part]);
      }
    });
  }, [arabicParts]);

  if (arabicParts === undefined) return;

  return (
    <div className="w-full flex flex-col gap-2 mt-4">
      <h2 className="text-xl font-bold">Partes Árabes</h2>

      <ul>
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
