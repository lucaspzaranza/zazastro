// src/components/ArabicPartsSync.tsx
"use client";
import { useEffect } from "react";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicParts } from "@/contexts/ArabicPartsContext";

export default function ArabicPartsSync() {
  const {
    birthChart,
    returnChart,
    lunarDerivedChart,
    sinastryChart,
    progressionChart,
    profectionChart,
  } = useBirthChart();
  const { arabicParts, calculateArabicParts, calculateBirthArchArabicParts } = useArabicParts();

  useEffect(() => {
    if (birthChart) calculateArabicParts(birthChart, "birth");
  }, [birthChart]);

  useEffect(() => {
    if (progressionChart) calculateBirthArchArabicParts(progressionChart.housesData.ascendant);
  }, [progressionChart]);

  useEffect(() => {
    if (returnChart) {
      calculateBirthArchArabicParts(returnChart.housesData.ascendant, { isLunarDerivedChart: false });
    }
  }, [returnChart, arabicParts]);

  useEffect(() => {
    if (lunarDerivedChart) {
      calculateBirthArchArabicParts(lunarDerivedChart.housesData.ascendant, { isLunarDerivedChart: true });
    }
  }, [lunarDerivedChart]);

  useEffect(() => {
    if (sinastryChart) calculateArabicParts(sinastryChart, "sinastry");
  }, [sinastryChart]);

  useEffect(() => {
    if (profectionChart) calculateBirthArchArabicParts(profectionChart.housesData.ascendant);
  }, [profectionChart]);

  return null;
}