import { useBirthChart } from "@/contexts/BirthChartContext";
import { useState } from "react";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/utils/chartUtils";

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

  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 mb-4">
      <div className="w-full text-left flex flex-col items-center">
        {!isCombinedWithBirthChart && (
          <ChartAndData
            innerChart={progressionChart}
            arabicParts={archArabicParts}
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
        )}

        {isCombinedWithBirthChart && (
          <ChartAndData
            innerChart={birthChart}
            outerChart={progressionChart}
            arabicParts={arabicParts}
            outerArabicParts={archArabicParts}
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
        )}
      </div>
    </div>
  );
}
