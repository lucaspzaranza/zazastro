import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/app/utils/constants";

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
              chartType: "birth",
              birthChart: birthChart,
              label: profileName,
            }}
            outerChartDateProps={{
              chartType: "birth",
              birthChart: sinastryChart,
              label: sinastryProfileName,
            }}
            title={`Sinastria - ${profileName} x ${sinastryProfileName}`}
          />
        </div>
      )}
    </div>
  );
}
