// src/app/components/charts/TransitsChart.tsx
"use client";
import { useEffect } from "react";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useTranslations } from "next-intl";
import ChartAndData from "../ChartAndData";
import { useChartCarousel } from "@/hooks/useChartCarousel";
import type { GenderType } from "@/interfaces/BirthChartInterfaces";

interface TransitsChartProps {
  rawData: any; // payload cru do endpoint birth-chart: { ...data, birthDate }, com data.transits ainda presente
  profileName: string;
  gender: GenderType;
}

export default function TransitsChart({ rawData, profileName, gender }: TransitsChartProps) {
  const { birthChart, updateBirthChart } = useBirthChart();
  const { arabicParts } = useArabicParts();
  const t = useTranslations();
  const { step, onPrevious, onNext, previousDisabled, nextDisabled } = useChartCarousel(2);

  const isNatalStep = step === 1;

  // Sempre parte do payload CRU pra alternar — nunca do birthChart já
  // processado do Context, que corromperia os valores se reprocessado.
  useEffect(() => {
    updateBirthChart({
      profileName,
      chartType: isNatalStep ? "birth" : "transits",
      chartData: isNatalStep ? { ...rawData, transits: undefined } : rawData,
      transits: isNatalStep ? undefined : rawData.transits,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNatalStep]);

  if (!birthChart) return null;

  return (
    <ChartAndData
      arabicParts={arabicParts}
      title={isNatalStep ? `${t("birthChart.chartTitle")}${profileName}` : `${t("transitsChart.title")} - ${profileName}`}
      innerChart={birthChart}
      chartDateProps={{
        chartType: isNatalStep ? "birth" : "transits",
        birthChart,
        chartDate: birthChart.birthDate
      }}
      gender={gender}
      onPrevious={onPrevious}
      onNext={onNext}
      previousDisabled={previousDisabled}
      nextDisabled={nextDisabled}
    />
  );
}