import React, { useEffect, useState } from "react";
import { getReturnDateRangeString } from "@/utils/chartUtils";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import Image from "next/image";
import { useChartCarousel } from "@/hooks/useChartCarousel";

export default function LunarDerivedChart() {
  const [returnTime, setReturnTime] = useState("");
  const [renderChart, setRenderChart] = useState(false);
  const { arabicParts, lunarDerivedParts, solarReturnParts } = useArabicParts();
  const [tableItemsPerPage, setTableItemsPerPage] = useState(ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT);
  const { birthChart, returnChart, lunarDerivedChart,
    isCombinedWithBirthChart, isCombinedWithReturnChart } = useBirthChart();
  const t = useTranslations();
  const { isMobileBreakPoint } = useScreenDimensions();
  const { currentProfile } = useProfiles();
  const { step, onPrevious, onNext, previousDisabled, nextDisabled } = useChartCarousel(3);

  const iconSize = 20;

  useEffect(() => {
    if (lunarDerivedChart && lunarDerivedChart.returnTime) {
      setReturnTime(lunarDerivedChart.returnTime);
      setRenderChart(true);
    }
  }, [lunarDerivedChart]);

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  function getLunarDerivedTitle(): React.ReactNode {
    return (
      <div className="flex flex-row items-center gap-1 text-[16px] min-w-0">
        <Image src="/planets/moon.png" width={iconSize} height={iconSize} alt="return" unoptimized className="flex-shrink-0" />
        <span className="flex-shrink-0 whitespace-nowrap">
          {!isMobileBreakPoint() ? t("returnChart.lunarDerivedReturnFor") : t("returnChart.lunarDerivedReturnForMobile")}
        </span>
        <span className="flex-shrink-0 whitespace-nowrap">
          {getReturnDateRangeString(returnTime ?? "0000-00-00 00:00:00", "lunar")}
          {" - "}
        </span>
        <span className="min-w-0 flex-1 truncate" title={currentProfile?.name}>{currentProfile?.name}</span>
      </div>
    );
  }

  function getSolarReturnTitle(): React.ReactNode {
    return (
      <div className="flex flex-row items-center gap-1 text-[16px] min-w-0">
        <Image src="/planets/sun.png" width={iconSize} height={iconSize} alt="return" unoptimized className="flex-shrink-0" />
        <span className="flex-shrink-0 whitespace-nowrap">
          {!isMobileBreakPoint() ? t("returnChart.solarReturnFor") : t("returnChart.solarReturnForMobile")}
        </span>
        <span className="flex-shrink-0 whitespace-nowrap">
          {getReturnDateRangeString(returnChart?.returnTime ?? "0000-00-00 00:00:00", "solar")}
          {" - "}
        </span>
        <span className="min-w-0 flex-1 truncate" title={currentProfile?.name}>{currentProfile?.name}</span>
      </div>
    );
  }

  const getNatalTitle = (): React.ReactNode => `${t("birthChart.chartTitle")}${currentProfile?.name ?? ""}`;

  const getInnerChart = (): BirthChart => {
    if (step === 2) return birthChart!;
    if (step === 1) return returnChart!;
    if (isCombinedWithBirthChart && birthChart) return birthChart;
    else if (isCombinedWithReturnChart && returnChart) return returnChart;
    return lunarDerivedChart!;
  }

  const getOuterChart = (): BirthChart | undefined => {
    if (step === 2 || step === 1) return undefined;
    if (isCombinedWithBirthChart || isCombinedWithReturnChart) return lunarDerivedChart;
    return undefined;
  }

  const getInnerArabicParts = (): ArabicPartsType | undefined => {
    if (step === 2) return arabicParts;
    if (step === 1) return solarReturnParts;
    if (isCombinedWithBirthChart) return arabicParts;
    else if (isCombinedWithReturnChart) return solarReturnParts;
    return lunarDerivedParts;
  }

  const getOuterArabicParts = (): ArabicPartsType | undefined => {
    if (step === 2 || step === 1) return undefined;
    if (isCombinedWithBirthChart || isCombinedWithReturnChart) return lunarDerivedParts;
    return undefined;
  }

  const getTitle = (): React.ReactNode => step === 2 ? getNatalTitle() : step === 1 ? getSolarReturnTitle() : getLunarDerivedTitle();

  const getChartDateProps = () => {
    if (step === 2) return { chartType: "birth" as const, birthChart: birthChart!, label: "Natal", chartDate: birthChart!.birthDate };
    if (step === 1) return { chartType: "return" as const, birthChart: returnChart!, label: t("returnChart.return"), chartDate: returnChart!.birthDate };
    return { chartType: "lunarDerived" as const, birthChart: lunarDerivedChart!, label: "Retorno", chartDate: lunarDerivedChart!.birthDate };
  };

  return (
    <div className="w-full flex flex-col items-center justify-between mb-4">
      {lunarDerivedChart && renderChart && (
        <ChartAndData
          innerChart={getInnerChart()}
          outerChart={getOuterChart()}
          arabicParts={getInnerArabicParts()}
          outerArabicParts={getOuterArabicParts()}
          tableItemsPerPage={tableItemsPerPage}
          onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
          chartDateProps={getChartDateProps()}
          title={getTitle()}
          gender={currentProfile?.gender}
          onPrevious={onPrevious}
          onNext={onNext}
          previousDisabled={previousDisabled}
          nextDisabled={nextDisabled}
        />
      )}
    </div>
  );
}