import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";
import { useTranslations } from "next-intl";

interface SinastryProps {
  sinastryChart?: BirthChart;
  sinastryProfileName?: string;
}

export default function SinastryChart(props: SinastryProps) {
  const { sinastryChart, sinastryProfileName } = props;

  const { profileName } = useBirthChart();
  const { birthChart } = useBirthChart();
  const { arabicParts, sinastryParts } = useArabicParts();
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );

  const t = useTranslations();

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
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
            title={`${t('synastryChart.sinastry')} - ${profileName} x ${sinastryProfileName}`}
          />
        </div>
      )}
    </div>
  );
}
