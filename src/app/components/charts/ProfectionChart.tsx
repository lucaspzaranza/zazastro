import { useBirthChart } from "@/contexts/BirthChartContext";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";
import { useProfiles } from "@/contexts/ProfilesContext";

export default function ProfectionChart() {
  const { profileName } = useBirthChart();
  const { birthChart, profectionChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const t = useTranslations();
  const { currentProfile } = useProfiles();

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
        chartType: "birth",
        birthChart: birthChart,
        label: t("profections.birth"),
        chartDate: birthChart.birthDate
      }}
      outerChartDateProps={{
        chartType: "profection",
        birthChart: profectionChart,
        label: t("profections.profected"),
        chartDate: profectionChart.birthDate
      }}
      title={getTitle()}
      gender={currentProfile?.gender}
    />
  );
}
