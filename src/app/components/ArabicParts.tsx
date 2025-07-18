"use client";

import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import type {
  ArabicParts,
  ArabicPart,
} from "@/interfaces/ArabicPartInterfaces";
import { useEffect, useRef, useState } from "react";
import { arabicPartKeys } from "../utils/chartUtils";

export default function ArabicParts() {
  const { birthChart } = useBirthChart();
  const { arabicParts, updateArabicParts } = useArabicParts();
  const lots = useArabicPartCalculations();

  const [parts, setParts] = useState<ArabicPart[]>([]);

  useEffect(() => {
    if (birthChart === undefined) return;

    updateArabicParts({
      fortune: lots.calculateLotOfFortune(birthChart),
      spirit: lots.calculateLotOfSpirit(birthChart),
    });
  }, [birthChart]);

  useEffect(() => {
    if (birthChart === undefined) return;

    if (arabicParts?.fortune && arabicParts.spirit) {
      updateArabicParts({
        necessity: lots.calculateLotOfNecessity(birthChart),
        love: lots.calculateLotOfLove(birthChart),
      });
    }

    if (arabicParts?.fortune) {
      updateArabicParts({
        valor: lots.calculateLotOfValor(birthChart),
        captivity: lots.calculateLotOfCaptivity(birthChart),
      });
    }

    if (arabicParts?.spirit) {
      updateArabicParts({
        victory: lots.calculateLotOfVictory(birthChart),
      });
    }

    // Custom Arabic Parts
    updateArabicParts({
      marriage: lots.calculateLotOfMarriage(birthChart),
      resignation: lots.calculateLotOfResignation(birthChart),
      children: lots.calculateLotOfChildren(birthChart),
    });
  }, [arabicParts?.fortune]);

  useEffect(() => {
    if (arabicParts === undefined) return;
    setParts([]);

    arabicPartKeys.forEach((key) => {
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
