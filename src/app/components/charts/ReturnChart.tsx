import { useBirthChart } from "@/contexts/BirthChartContext";
import { useEffect, useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import {
  getReturnDateRangeString,
} from "@/utils/chartUtils";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";
import { useProfiles } from "@/contexts/ProfilesContext";

export default function ReturnChart() {
  const { profileName } = useBirthChart();
  const { birthChart, returnChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const [isSolarReturn, setIsSolarReturn] = useState(true);
  const [isSolarReturnSet, setIsSolarReturnSet] = useState(false);
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );
  const { currentProfile } = useProfiles();

  const t = useTranslations();

  useEffect(() => {
    setIsSolarReturn(returnChart?.returnType === "solar");
    setIsSolarReturnSet(true);
  }, [returnChart, isCombinedWithBirthChart]);

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  function getTitle() {
    return `${isSolarReturn ? t("returnChart.solarReturnFor") : t("returnChart.lunarReturnFor")}  
            ${getReturnDateRangeString(
      returnChart?.returnTime ?? "0000-00-00 00:00:00",
      isSolarReturn ? "solar" : "lunar"
    )} - ${profileName}`;
  }

  const getInnerChart = (): BirthChart => !isCombinedWithBirthChart ? returnChart! : birthChart!;
  const getOuterchart = (): BirthChart | undefined => !isCombinedWithBirthChart ? undefined : returnChart;
  const getInnerArabicParts = (): ArabicPartsType | undefined =>
    !isCombinedWithBirthChart ? archArabicParts : arabicParts
  const getOuterArabicParts = (): ArabicPartsType | undefined =>
    isCombinedWithBirthChart ? archArabicParts : undefined;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 mb-4">
      {isSolarReturnSet && returnChart && returnChart.timezone && (
        <div className="w-full text-left flex flex-col items-center">
          <ChartAndData
            innerChart={getInnerChart()}
            outerChart={getOuterchart()}
            arabicParts={getInnerArabicParts()}
            outerArabicParts={getOuterArabicParts()}
            tableItemsPerPage={tableItemsPerPage}
            onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            chartDateProps={{
              chartType: "return",
              birthChart: returnChart,
              label: t("returnChart.return"),
              chartDate: returnChart.birthDate
            }}
            title={getTitle()}
            gender={currentProfile?.gender}
          />
        </div>
      )}
    </div >
  );
}
