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
import Image from "next/image";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";

export default function ReturnChart() {
  const { profileName } = useBirthChart();
  const { isMobileBreakPoint} = useScreenDimensions();
  const { birthChart, returnChart, isCombinedWithBirthChart } = useBirthChart();
  const { arabicParts, archArabicParts } = useArabicParts();
  const [isSolarReturn, setIsSolarReturn] = useState(true);
  const [isSolarReturnSet, setIsSolarReturnSet] = useState(false);
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );
  const { currentProfile } = useProfiles();

  const t = useTranslations();

  const iconSize = 14;

  useEffect(() => {
    setIsSolarReturn(returnChart?.returnType === "solar");
    setIsSolarReturnSet(true);
  }, [returnChart, isCombinedWithBirthChart]);

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  function getTitle(): React.ReactNode {
    return (
      <div className="flex flex-row items-center gap-1 text-[16px] min-w-0">
        <Image
          src={"/planets/" + (isSolarReturn ? "sun" : "moon") + ".png"}
          width={iconSize}
          height={iconSize}
          alt="return"
          unoptimized
          className="flex-shrink-0"
        />

        <span className="flex-shrink-0 whitespace-nowrap">
          {isSolarReturn
            ? !isMobileBreakPoint() ? t("returnChart.solarReturnFor") : t("returnChart.solarReturnForMobile")
            : !isMobileBreakPoint() ? t("returnChart.lunarReturnFor") : t("returnChart.lunarReturnForMobile")}
        </span>

        <span className="flex-shrink-0 whitespace-nowrap">
          {getReturnDateRangeString(
            returnChart?.returnTime ?? "0000-00-00 00:00:00",
            isSolarReturn ? "solar" : "lunar"
          )}
          {" - "}
        </span>

        <span
          className="min-w-0 flex-1 truncate"
          title={profileName}
        >
          {profileName}
        </span>
      </div>
    );
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
