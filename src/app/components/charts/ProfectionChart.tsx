import { useBirthChart } from "@/contexts/BirthChartContext";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";

export default function ProfectionChart() {
  const { profileName } = useBirthChart();
  const { birthChart, profectionChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();

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

  console.log(arabicParts);

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
        label: isCombinedWithBirthChart ? "Natal" : "Profectado",
      }}
      outerChartDateProps={isCombinedWithBirthChart ? {
        chartType: "profection",
        birthChart: profectionChart,
        label: "Profectado",
      } : undefined}
      title={`Profecção Anual - ${profileName}`}
    />
  );
}
