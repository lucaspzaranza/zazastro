// src/app/components/charts/SecondaryProgressionChart.tsx
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";
import { toDate } from "@/app/utils/chartUtils";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useChartCarousel } from "@/hooks/useChartCarousel";

export default function SecondaryProgressionChart() {
  const { profileName } = useBirthChart();
  const { birthChart, progressionChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const t = useTranslations();
  const { currentProfile } = useProfiles();
  const { step, onPrevious, onNext, previousDisabled, nextDisabled } = useChartCarousel(2);

  const [tableItemsPerPage, setTableItemsPerPage] = useState(ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT);

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  if (!progressionChart || !birthChart) {
    return null;
  }

  const isNatalStep = step === 1;

  const getInnerChart = (): BirthChart =>
    isNatalStep ? birthChart! : (!isCombinedWithBirthChart ? progressionChart! : birthChart!);
  const getOuterchart = (): BirthChart | undefined =>
    isNatalStep ? undefined : (!isCombinedWithBirthChart ? undefined : progressionChart);
  const getInnerArabicParts = (): ArabicPartsType | undefined =>
    isNatalStep ? arabicParts : (!isCombinedWithBirthChart ? archArabicParts : arabicParts);
  const getOuterArabicParts = (): ArabicPartsType | undefined =>
    isNatalStep ? undefined : (!isCombinedWithBirthChart ? undefined : archArabicParts);

  function getProgressionTitle() {
    if (!progressionChart?.birthDate || !birthChart?.birthDate)
      return `${t('secondaryProgressions.title')} - ${profileName}`;

    const date1 = toDate(birthChart.birthDate);
    const date2 = toDate(progressionChart.birthDate);
    const diffMs = date2.getTime() - date1.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const progressedYears = diffDays;
    const nextYear = progressedYears + 1;
    const targetYear = birthChart.birthDate.year + progressedYears;
    const targetNextYear = targetYear + 1;

    return `${t('secondaryProgressions.title')} ${progressedYears}/${nextYear} (${targetYear}/${targetNextYear}) - ${profileName}`;
  }

  function getNatalTitle() {
    return `${t("birthChart.chartTitle")}${profileName}`;
  }

  return (
    <ChartAndData
      innerChart={getInnerChart()}
      outerChart={getOuterchart()}
      arabicParts={getInnerArabicParts()}
      outerArabicParts={getOuterArabicParts()}
      tableItemsPerPage={tableItemsPerPage}
      onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
      chartDateProps={{
        chartType: "birth",
        birthChart: birthChart,
        label: isNatalStep ? profileName : t("secondaryProgressions.birth"),
        chartDate: birthChart.birthDate
      }}
      outerChartDateProps={isNatalStep ? undefined : {
        chartType: "birth",
        birthChart: progressionChart,
        label: t("secondaryProgressions.progressed"),
        chartDate: progressionChart.birthDate
      }}
      title={isNatalStep ? getNatalTitle() : getProgressionTitle()}
      gender={currentProfile?.gender}
      onPrevious={onPrevious}
      onNext={onNext}
      previousDisabled={previousDisabled}
      nextDisabled={nextDisabled}
    />
  );
}
