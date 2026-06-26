import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthChart, GenderType } from "@/interfaces/BirthChartInterfaces";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { getGenderIconPath } from "@/app/utils/chartUtils";

interface SinastryProps {
  sinastryChart?: BirthChart;
  sinastryProfileName?: string;
  gender?: GenderType;
  genderSinastry?: GenderType;
}

export default function SinastryChart(props: SinastryProps) {
  const { sinastryChart, sinastryProfileName, gender, genderSinastry } = props;

  const { profileName } = useBirthChart();
  const { birthChart } = useBirthChart();
  const { arabicParts, sinastryParts } = useArabicParts();
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );

  const t = useTranslations();
  const genderIconSize = 20;

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  const getTitle = () => {
    return <>
      {t('synastryChart.sinastry')} - 
        <span className="flex flex-row items-center gap-1">
          {profileName}
          <Image src={getGenderIconPath(gender ?? "event")} width={genderIconSize} height={genderIconSize} alt="genderIcon"/>
        </span> x 
        <span className="flex flex-row items-center gap-1">
          {sinastryProfileName}
          <Image src={getGenderIconPath(genderSinastry ?? "event")} width={genderIconSize} height={genderIconSize} alt="genderIcon"/>
        </span>
      </>
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 mb-4">
      {birthChart && sinastryChart && sinastryParts && (
        <div className="w-full text-left flex flex-col items-center">
          <ChartAndData
            innerChart={birthChart}
            outerChart={sinastryChart}
            arabicParts={arabicParts}
            outerArabicParts={sinastryParts}
            tableItemsPerPage={tableItemsPerPage}
            onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            chartDateProps={{
              chartType: "sinastry",
              birthChart: birthChart,
              label: profileName,
              chartDate: birthChart.birthDate
            }}
            outerChartDateProps={{
              chartType: "sinastry",
              birthChart: sinastryChart,
              label: sinastryProfileName,
              chartDate: sinastryChart.birthDate
            }}
            title={getTitle()}
            gender={gender}
          />
        </div>
      )}
    </div>
  );
}
