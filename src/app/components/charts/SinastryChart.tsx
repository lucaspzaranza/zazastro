// src/app/components/charts/SinastryChart.tsx
import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthChart, GenderType } from "@/interfaces/BirthChartInterfaces";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { getGenderIconPath } from "@/app/utils/chartUtils";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import { useChartCarousel } from "@/hooks/useChartCarousel";

interface SinastryProps {
  sinastryChart?: BirthChart;
  sinastryProfileName?: string;
  gender?: GenderType;
  genderSinastry?: GenderType;
}

export default function SinastryChart(props: SinastryProps) {
  const { sinastryChart, sinastryProfileName, gender, genderSinastry } = props;
  const { isMobileBreakPoint } = useScreenDimensions();
  const { profileName, birthChart } = useBirthChart();
  const { arabicParts, sinastryParts } = useArabicParts();
  const [tableItemsPerPage, setTableItemsPerPage] = useState(ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT);
  const { step, onPrevious, onNext, previousDisabled, nextDisabled } = useChartCarousel(3);

  const t = useTranslations();
  const genderIconSize = 20;

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  // step 0 = combinado (padrão) | step 1 = mapa externo sozinho | step 2 = mapa interno sozinho
  const isCombinedStep = step === 0;
  const isOuterAloneStep = step === 1;

  function getCombinedTitle(): React.ReactNode {
    return (
      <div className="w-full flex flex-row items-center justify-center gap-1 text-[16px]">
        {!isMobileBreakPoint() ? <span className="flex-shrink-0 whitespace-nowrap">{t('synastryChart.sinastry')} - </span> : null}

        <div className="flex flex-row items-center gap-1 min-w-0 justify-end">
          <span className="min-w-0 truncate" title={profileName}>{profileName}</span>
          <Image src={getGenderIconPath(gender ?? "event")} width={genderIconSize} height={genderIconSize} alt="genderIcon" className="flex-shrink-0" />
        </div>

        <span className="flex-shrink-0">&nbsp;x&nbsp;</span>

        <div className="flex flex-row items-center gap-1 min-w-0">
          <span className="min-w-0 truncate" title={sinastryProfileName}>{sinastryProfileName}</span>
          <Image src={getGenderIconPath(genderSinastry ?? "event")} width={genderIconSize} height={genderIconSize} alt="genderIcon" className="flex-shrink-0" />
        </div>
      </div>
    );
  }

  const getAloneTitle = (): React.ReactNode =>
    isOuterAloneStep
      ? `${t("birthChart.chartTitle")}${sinastryProfileName ?? ""}`
      : `${t("birthChart.chartTitle")}${profileName}`;

  const getInnerChart = (): BirthChart => {
    if (isCombinedStep) return birthChart!;
    if (isOuterAloneStep) return sinastryChart!;
    return birthChart!;
  };

  const getOuterChart = (): BirthChart | undefined => isCombinedStep ? sinastryChart : undefined;

  const getInnerArabicParts = () => {
    if (isCombinedStep) return arabicParts;
    if (isOuterAloneStep) return sinastryParts;
    return arabicParts;
  };

  const getOuterArabicParts = () => isCombinedStep ? sinastryParts : undefined;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 mb-4">
      {birthChart && sinastryChart && sinastryParts && (
        <div className="w-full text-left flex flex-col items-center">
          <ChartAndData
            innerChart={getInnerChart()}
            outerChart={getOuterChart()}
            arabicParts={getInnerArabicParts()}
            outerArabicParts={getOuterArabicParts()}
            tableItemsPerPage={tableItemsPerPage}
            onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            chartDateProps={{
              chartType: "sinastry",
              birthChart: isOuterAloneStep ? sinastryChart : birthChart,
              label: isOuterAloneStep ? sinastryProfileName : profileName,
              chartDate: isOuterAloneStep ? sinastryChart.birthDate : birthChart.birthDate
            }}
            outerChartDateProps={isCombinedStep ? {
              chartType: "sinastry",
              birthChart: sinastryChart,
              label: sinastryProfileName,
              chartDate: sinastryChart.birthDate
            } : undefined}
            title={isCombinedStep ? getCombinedTitle() : getAloneTitle()}
            gender={isOuterAloneStep ? genderSinastry : gender}
            onPrevious={onPrevious}
            onNext={onNext}
            previousDisabled={previousDisabled}
            nextDisabled={nextDisabled}
          />
        </div>
      )}
    </div>
  );
}