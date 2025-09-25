import { useBirthChart } from "@/contexts/BirthChartContext";
import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { useEffect, useState } from "react";
import { ChartDate } from "../ChartDate";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from "../ChartAndData";
import { ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT } from "@/utils/chartUtils";
import ChartSelectorArrows from "../ChartSelectorArrows";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";

interface SinastryProps {
  sinastryChart?: BirthChart;
  sinastryProfileName?: string;
}

export default function SinastryChart(props: SinastryProps) {
  const { sinastryChart, sinastryProfileName } = props;

  const { profileName } = useBirthChart();
  const { birthChart } = useBirthChart();
  const lots = useArabicPartCalculations();
  // const [partsArray, setParts] = useState<ArabicPart[]>([]);
  const { sinastryParts, updateSinastryArabicParts } = useArabicParts();
  const [tableItemsPerPage, setTableItemsPerPage] = useState(
    ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT
  );

  useEffect(() => {
    if (sinastryChart === undefined) return;

    updateSinastryArabicParts({
      fortune: lots.calculateLotOfFortune(sinastryChart),
      spirit: lots.calculateLotOfSpirit(sinastryChart),
    });
  }, [sinastryChart]);

  useEffect(() => {
    let obj = { ...sinastryParts };

    if (sinastryChart === undefined) return;

    if (sinastryParts?.fortune && sinastryParts.spirit) {
      obj = {
        ...obj,
        necessity: lots.calculateLotOfNecessity(sinastryChart),
        love: lots.calculateLotOfLove(sinastryChart),
      };
    }

    if (sinastryParts?.fortune) {
      obj = {
        ...obj,
        valor: lots.calculateLotOfValor(sinastryChart),
        captivity: lots.calculateLotOfCaptivity(sinastryChart),
      };
    }

    if (sinastryParts?.spirit) {
      obj = {
        ...obj,
        victory: lots.calculateLotOfVictory(sinastryChart),
      };
    }

    // Custom Arabic Parts
    updateSinastryArabicParts({
      ...obj,
      marriage: lots.calculateLotOfMarriage(sinastryChart),
      resignation: lots.calculateLotOfResignation(sinastryChart),
      children: lots.calculateLotOfChildren(sinastryChart),
    });
  }, [sinastryParts?.fortune]);

  useEffect(() => {
    if (sinastryParts === undefined) return;

    // setParts([]);

    // arabicPartKeys.forEach((key) => {
    //   const part = arabicParts[key];

    //   if (part) {
    //     setParts((prev) => [...prev, part]);
    //   }
    // });
  }, [sinastryParts]);

  function handleOnItemsPerPagechanged(newItemsPerPage: number) {
    setTableItemsPerPage(newItemsPerPage);
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 mb-4">
      <ChartSelectorArrows className="w-full md:w-[60%]">
        {profileName && (
          <h1 className="text-lg md:text-2xl font-bold text-center">
            Sinastria - {profileName} x {sinastryProfileName}
          </h1>
        )}
      </ChartSelectorArrows>

      {birthChart && sinastryChart && (
        <div className="w-full text-left flex flex-col items-center">
          <ChartDate chartType="return" />

          {sinastryChart && (
            <ChartAndData
              innerChart={birthChart}
              outerChart={sinastryChart}
              outerArabicParts={sinastryParts}
              useArchArabicPartsForDataVisualization={false}
              tableItemsPerPage={tableItemsPerPage}
              onTableItemsPerPageChanged={handleOnItemsPerPagechanged}
            />
          )}
        </div>
      )}
    </div>
  );
}
