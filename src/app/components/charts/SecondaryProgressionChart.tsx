import { useBirthChart } from "@/contexts/BirthChartContext";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";
import { toDate } from "@/app/utils/chartUtils";

export default function SecondaryProgressionChart() {
  const { profileName } = useBirthChart();
  const { birthChart, progressionChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const t = useTranslations();

  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  if (!progressionChart || !birthChart) {
    return null;
  }

  function getTitle() {
    if(!progressionChart?.birthDate || !birthChart?.birthDate) 
      return `${t('secondaryProgressions.title')} - ${profileName}`;    
    
    const date1 = toDate(birthChart.birthDate);
    const date2 = toDate(progressionChart.birthDate);
   
    const diffMs = date2.getTime() - date1.getTime();
    const diffDays = Math.floor(
      diffMs / (1000 * 60 * 60 * 24)
    );

    const progressedYears = diffDays + 1;
    const nextYear = progressedYears + 1;

    const targetYear = birthChart.birthDate.year + progressedYears;
    const targetNextYear = targetYear + 1;

    return `${t('secondaryProgressions.title')} ${progressedYears}/${nextYear} (${targetYear}/${targetNextYear}) - ${profileName}`;
  }

  const getInnerChart = (): BirthChart => !isCombinedWithBirthChart ? progressionChart! : birthChart!;

  const getOuterchart = (): BirthChart | undefined => !isCombinedWithBirthChart ? undefined : progressionChart;

  const getInnerArabicParts = (): ArabicPartsType | undefined =>
    !isCombinedWithBirthChart ? archArabicParts : arabicParts;

  const getOuterArabicParts = (): ArabicPartsType | undefined =>
    !isCombinedWithBirthChart ? undefined : archArabicParts;

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
        label: t("secondaryProgressions.birth"),
        chartDate: birthChart.birthDate
      }}
      outerChartDateProps={{
        chartType: "birth",
        birthChart: progressionChart,
        label: t("secondaryProgressions.progressed"),
        chartDate: progressionChart.birthDate
      }}
      // title={`${t('secondaryProgressions.title')} - ${profileName}`}
      title={getTitle()}
    />
  );
}
