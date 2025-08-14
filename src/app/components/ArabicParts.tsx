"use client";

import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";
import type {
  ArabicPartsType,
  ArabicPart,
} from "@/interfaces/ArabicPartInterfaces";
import { useEffect, useRef, useState } from "react";
import {
  arabicPartKeys,
  formatSignColor,
  getArabicPartImage,
} from "../utils/chartUtils";

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

  // return; // REMOVE THIS, IT'LL PREVENT THE CODE BELOW TO BE RENDERED

  return (
    <div className="flex flex-col gap-2 mt-4">
      <h2 className="text-xl font-bold">Partes Árabes</h2>

      <ul>
        {parts.map((arabicPart, index) => {
          return (
            <li key={index} className="flex flex-row items-center">
              <div className="w-full flex flex-row">
                <span className="w-[14rem] flex flex-row items-center">
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
