import { useBirthChart } from "@/contexts/BirthChartContext";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";

export default function ProfectionChart() {
  const { profileName } = useBirthChart();
  const { birthChart, profectionChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const t = useTranslations();

  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  if (!profectionChart || !birthChart) {
    return null;
  }

  const getInnerChart = (): BirthChart => !isCombinedWithBirthChart ? profectionChart! : birthChart!;

  const getOuterchart = (): BirthChart | undefined => !isCombinedWithBirthChart ? undefined : profectionChart;

  const getInnerArabicParts = (): ArabicPartsType | undefined =>
    !isCombinedWithBirthChart ? archArabicParts : arabicParts;

  const getOuterArabicParts = (): ArabicPartsType | undefined =>
    !isCombinedWithBirthChart ? undefined : archArabicParts;

  function getTitle() {
    console.log(birthChart);
    console.log(profectionChart);
    
    if(!birthChart?.birthDate || !profectionChart?.birthDate) 
      return `${t('profections.title')} - ${profileName}`;    
    
    const progressedYears = profectionChart!.birthDate.year - birthChart.birthDate.year;
    const nextYear = progressedYears + 1;

    const targetYear = birthChart.birthDate.year + progressedYears;
    const targetNextYear = targetYear + 1;

    return `${t('profections.profected')} ${progressedYears}/${nextYear} (${targetYear}/${targetNextYear}) - ${profileName}`;
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
        chartType: isCombinedWithBirthChart ? "birth" : "profection",
        birthChart: getInnerChart(),
        label: isCombinedWithBirthChart ? t("profections.birth") : t("profections.profected"),
        chartDate: getInnerChart().birthDate
      }}
      outerChartDateProps={isCombinedWithBirthChart ? {
        chartType: "profection",
        birthChart: profectionChart,
        label: t("profections.profected"),
        chartDate: profectionChart.birthDate
      } : undefined}
      // title={`${t('profections.title')} - ${profileName}`}
      title={getTitle()}
    />
  );
}
