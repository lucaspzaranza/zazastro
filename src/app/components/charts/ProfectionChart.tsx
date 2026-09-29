import { useBirthChart } from "@/contexts/BirthChartContext";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useChartCarousel } from "@/hooks/useChartCarousel";

export default function ProfectionChart() {
  const { profileName } = useBirthChart();
  const { birthChart, profectionChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const t = useTranslations();
  const { currentProfile } = useProfiles();
  const { step, onPrevious, onNext, previousDisabled, nextDisabled } = useChartCarousel(2);

  const [tableItemsPerPage, setTableItemsPerPage] = useState(ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT);

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  if (!profectionChart || !birthChart) {
    return null;
  }

  const isNatalStep = step === 1;

  const getInnerChart = (): BirthChart =>
    isNatalStep ? birthChart! : (!isCombinedWithBirthChart ? profectionChart! : birthChart!);
  const getOuterchart = (): BirthChart | undefined =>
    isNatalStep ? undefined : (!isCombinedWithBirthChart ? undefined : profectionChart);
  const getInnerArabicParts = (): ArabicPartsType | undefined =>
    isNatalStep ? arabicParts : (!isCombinedWithBirthChart ? archArabicParts : arabicParts);
  const getOuterArabicParts = (): ArabicPartsType | undefined =>
    isNatalStep ? undefined : (!isCombinedWithBirthChart ? undefined : archArabicParts);

  function getProfectionTitle() {
    if (!birthChart?.birthDate || !profectionChart?.birthDate)
      return `${t('profections.title')} - ${profileName}`;

    const progressedYears = profectionChart!.birthDate.year - birthChart.birthDate.year;
    const nextYear = progressedYears + 1;
    const targetYear = birthChart.birthDate.year + progressedYears;
    const targetNextYear = targetYear + 1;

    return `${t('profections.profected')} ${progressedYears}/${nextYear} (${targetYear}/${targetNextYear}) - ${profileName}`;
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
        chartType: isNatalStep ? "birth" : "birth",
        birthChart: isNatalStep ? birthChart : birthChart,
        label: isNatalStep ? profileName : t("profections.birth"),
        chartDate: birthChart.birthDate
      }}
      outerChartDateProps={isNatalStep ? undefined : {
        chartType: "profection",
        birthChart: profectionChart,
        label: t("profections.profected"),
        chartDate: profectionChart.birthDate
      }}
      title={isNatalStep ? getNatalTitle() : getProfectionTitle()}
      gender={currentProfile?.gender}
      onPrevious={onPrevious}
      onNext={onNext}
      previousDisabled={previousDisabled}
      nextDisabled={nextDisabled}
    />
  );
}