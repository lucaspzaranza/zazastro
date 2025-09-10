import React, { useState } from "react";
import ArabicPartCalculatorDropdown from "./ArabicPartCalculatorDropdown";
import {
  ArabicPartCalculatorDropdownItem,
  ArabicPartsType,
} from "@/interfaces/ArabicPartInterfaces";
import { ChartElement } from "@/interfaces/AstroChartInterfaces";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { extractHouseNumber } from "@/app/utils/chartUtils";

interface ArabicPartCalculatorProps {
  onClose?: () => void;
}

export default function ArabicPartCalculatorModal(
  props: ArabicPartCalculatorProps
) {
  const { onClose } = props;

  const { birthChart } = useBirthChart();
  const { arabicParts } = useArabicParts();

  const [projectionPoint, setProjectionPoint] = useState<ChartElement>();
  const [significator, setSignificator] = useState<ChartElement>();
  const [trigger, setTrigger] = useState<ChartElement>();

  function getElementFromChart(
    element: ArabicPartCalculatorDropdownItem
  ): ChartElement | undefined {
    let chartElement: ChartElement | undefined;

    if (element.type === "planet") {
      const planet = birthChart?.planets.find((p) => p.type === element.key);
      if (planet) {
        chartElement = {
          elementType: "planet",
          longitude: planet.longitude,
          id: planet.id,
          isAntiscion: false,
          isFromOuterChart: false,
          isRetrograde: false,
          name: planet.name,
          planetType: planet.type,
        };
      }
    } else if (element.type === "house") {
      const houseNumber = extractHouseNumber(element.key);
      if (houseNumber !== null) {
        const house = birthChart?.housesData.house[houseNumber];
        chartElement = {
          elementType: "house",
          id: 0,
          longitude: house ?? 0,
          isAntiscion: false,
          isFromOuterChart: false,
          isRetrograde: false,
          name: element.name,
        };
      }
    } else if (element.type === "arabicPart") {
      const key = element.key as keyof ArabicPartsType;
      if (!arabicParts) return undefined;

      const lot = arabicParts[key];
      if (!lot) return undefined;

      chartElement = {
        elementType: "arabicPart",
        id: 0,
        isAntiscion: false,
        isFromOuterChart: false,
        isRetrograde: false,
        longitude: lot.longitude,
        name: element.name,
      };
    }

    console.log("chartElement is", chartElement);

    return chartElement;
  }

  function selectItem(
    element: ArabicPartCalculatorDropdownItem,
    elementTypeIndex: number
  ) {
    console.log(element);

    if (elementTypeIndex === 0) {
      const foundElement = getElementFromChart(element);
    } else if (elementTypeIndex === 1) {
    } else {
    }
  }

  return (
    <div className="absolute w-[27rem] h-[80vh] flex flex-row top-[-22%] items-center justify-start z-10">
      <div className="w-[41rem] h-[25rem] bg-white outline-2">
        <header className="relative w-full h-[3rem] bg-white flex flex-row items-center justify-center outline-1">
          <h1 className="font-bold text-xl">Calcular Parte Árabe</h1>
          <button
            className="absolute right-1 flex flex-row items-center justify-center"
            onClick={() => {
              onClose?.();
            }}
          >
            <div className="absolute w-[25px] h-[25px] hover:opacity-20 hover:bg-gray-400 active:bg-gray-900" />
            <img src="close.png" width={30} />
          </button>
        </header>

        <div className="p-3">
          <h2 className="w-full text-[0.9rem] text-center mb-1">
            Escolha os pontos para o cálculo da parte.
          </h2>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-full flex flex-row gap-2">
              <ArabicPartCalculatorDropdown
                label="Origem"
                onSelect={(el) => selectItem(el, 0)}
              />
              +
              <ArabicPartCalculatorDropdown
                label="Até"
                onSelect={(el) => selectItem(el, 1)}
              />
              -
              <ArabicPartCalculatorDropdown
                label="De"
                onSelect={(el) => selectItem(el, 2)}
              />
            </div>

            <button className="bg-blue-800 w-1/2 text-white px-4 py-1 rounded hover:bg-blue-900">
              Calcular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
