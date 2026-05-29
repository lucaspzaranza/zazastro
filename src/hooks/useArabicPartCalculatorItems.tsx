"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArabicPartCalculatorDropdownItem } from "@/interfaces/ArabicPartInterfaces";

export function useArabicPartCalculatorItems(): Record<
  string,
  ArabicPartCalculatorDropdownItem[]
> {
  const t = useTranslations();

  return useMemo(
    () => ({
      angles: [
        { name: "AC", type: "house", key: "house-0" },
        { name: "IC", type: "house", key: "house-3" },
        { name: "DC", type: "house", key: "house-6" },
        { name: "MC", type: "house", key: "house-9" },
      ],

      planets: [
        { name: t("planets.sun"), type: "planet", key: "sun" },
        { name: t("planets.moon"), type: "planet", key: "moon" },
        { name: t("planets.mercury"), type: "planet", key: "mercury" },
        { name: t("planets.venus"), type: "planet", key: "venus" },
        { name: t("planets.mars"), type: "planet", key: "mars" },
        { name: t("planets.jupiter"), type: "planet", key: "jupiter" },
        { name: t("planets.saturn"), type: "planet", key: "saturn" },
      ],

      houses: [
        { name: t("birthChart.house") + " 1 (AC)", type: "house", key: "house-0" },
        { name: t("birthChart.house") + " 2", type: "house", key: "house-1" },
        { name: t("birthChart.house") + " 3", type: "house", key: "house-2" },
        { name: t("birthChart.house") + " 4 (IC)", type: "house", key: "house-3" },
        { name: t("birthChart.house") + " 5", type: "house", key: "house-4" },
        { name: t("birthChart.house") + " 6", type: "house", key: "house-5" },
        { name: t("birthChart.house") + " 7 (DC)", type: "house", key: "house-6" },
        { name: t("birthChart.house") + " 8", type: "house", key: "house-7" },
        { name: t("birthChart.house") + " 9", type: "house", key: "house-8" },
        { name: t("birthChart.house") + " 10 (MC)", type: "house", key: "house-9" },
        { name: t("birthChart.house") + " 11", type: "house", key: "house-10" },
        { name: t("birthChart.house") + " 12", type: "house", key: "house-11" },
      ],

      lots: [
        { name: t("arabicParts.fortune.short"), type: "arabicPart", key: "fortune" },
        { name: t("arabicParts.spirit.short"), type: "arabicPart", key: "spirit" },
        { name: t("arabicParts.necessity.short"), type: "arabicPart", key: "necessity" },
        { name: t("arabicParts.love.short"), type: "arabicPart", key: "love" },
        { name: t("arabicParts.valor.short"), type: "arabicPart", key: "valor" },
        { name: t("arabicParts.victory.short"), type: "arabicPart", key: "victory" },
        { name: t("arabicParts.captivity.short"), type: "arabicPart", key: "captivity" },
      ],
    }),
    [t]
  );
}