import { useBirthChart } from "@/contexts/BirthChartContext";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";

export default function SecondaryProgressionChart() {
  const { profileName } = useBirthChart();
  const { birthChart, progressionChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();

  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  if (!progressionChart || !birthChart) {
    return null;
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
        label: "Nascimento",
      }}
      outerChartDateProps={{
        chartType: "birth",
        birthChart: progressionChart,
        label: "Progredido",
      }}
      title={`Progressão Secundária - ${profileName}`}
    />
  );
}
