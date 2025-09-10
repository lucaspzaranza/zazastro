import React, { useEffect, useState } from "react";
import ArabicPartCalculatorDropdown from "./ArabicPartCalculatorDropdown";
import {
  ArabicPartCalculatorDropdownItem,
  ArabicPartsType,
} from "@/interfaces/ArabicPartInterfaces";
import {
  ChartElement,
  ChartElementForArabicPartCalculation,
} from "@/interfaces/AstroChartInterfaces";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import {
  convertDecimalIntoDegMinString,
  decimalToDegreesMinutes,
  extractHouseNumber,
  formatSignColor,
  getDegreeAndSign,
  mod360,
} from "@/app/utils/chartUtils";

interface ArabicPartCalculatorProps {
  onClose?: () => void;
}

export default function ArabicPartCalculatorModal(
  props: ArabicPartCalculatorProps
) {
  const { onClose } = props;

  const { birthChart } = useBirthChart();
  const { arabicParts } = useArabicParts();

  const [projectionPoint, setProjectionPoint] =
    useState<ChartElementForArabicPartCalculation>();
  const [significator, setSignificator] =
    useState<ChartElementForArabicPartCalculation>();
  const [trigger, setTrigger] =
    useState<ChartElementForArabicPartCalculation>();

  const [showLotCalculation, setShowLotCalculation] = useState(false);
  const [lotCalculationHTML, setLotCalculationHTML] =
    useState<React.ReactNode>();

  useEffect(() => {
    console.log("start");
    if (!birthChart) return;

    const acElement: ChartElementForArabicPartCalculation = {
      name: "AC",
      elementType: "house",
      longitude: birthChart?.housesData.house[0],
    };

    setProjectionPoint(acElement);
    setSignificator(acElement);
    setTrigger(acElement);
  }, [birthChart]);

  function getElementFromChart(
    element: ArabicPartCalculatorDropdownItem
  ): ChartElementForArabicPartCalculation | undefined {
    let chartElement: ChartElementForArabicPartCalculation | undefined;

    if (element.type === "planet") {
      const planet = birthChart?.planets.find((p) => p.type === element.key);
      if (planet) {
        chartElement = {
          name: planet.name,
          elementType: "planet",
          longitude: planet.longitudeRaw,
        };
      }
    } else if (element.type === "house") {
      const houseNumber = extractHouseNumber(element.key);
      if (houseNumber !== null) {
        const house = birthChart?.housesData.house[houseNumber];
        if (!house) return undefined;

        chartElement = {
          elementType: "house",
          longitude: house,
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
        longitude: lot.longitudeRaw,
        name: element.name,
      };
    }

    return chartElement;
  }

  function selectItem(
    element: ArabicPartCalculatorDropdownItem,
    elementTypeIndex: number
  ) {
    const foundElement = getElementFromChart(element);

    if (elementTypeIndex === 0) {
      setProjectionPoint(foundElement);
    } else if (elementTypeIndex === 1) {
      setSignificator(foundElement);
    } else {
      setTrigger(foundElement);
    }
  }

  function calculateLot(): void {
    if (!projectionPoint || !significator || !trigger) {
      setLotCalculationHTML(
        <>
          Algum dos campos está vazio, por favor selecione os elementos para o
          cálculo.
        </>
      );
      return;
    }

    const distance = mod360(
      Math.abs(significator?.longitude - trigger?.longitude)
    );

    const distanceString = convertDecimalIntoDegMinString(
      decimalToDegreesMinutes(distance)
    );

    const projectedLongitude = mod360(
      decimalToDegreesMinutes(projectionPoint.longitude + distance)
    );
    const projectedLongitudeString = convertDecimalIntoDegMinString(
      decimalToDegreesMinutes(projectedLongitude)
    );

    setLotCalculationHTML(
      <div className="w-full text-center mt-2">
        <strong>
          Parte Árabe está em{" "}
          {formatSignColor(getDegreeAndSign(projectedLongitude, true))}.
        </strong>
        <div className="w-full flex flex-col mt-2">
          <strong>Detalhes do cálculo:</strong>
          <div className="flex flex-col text-start text-sm">
            <span>
              Significador <strong>(B)</strong>:{" "}
              <strong>{significator.name}</strong>
              {" em "}
              {formatSignColor(
                getDegreeAndSign(
                  decimalToDegreesMinutes(significator.longitude),
                  true
                )
              )}
              .
            </span>

            <span>
              Gatilho <strong>(C)</strong>: <strong>{trigger.name}</strong>
              {" em "}
              {formatSignColor(
                getDegreeAndSign(
                  decimalToDegreesMinutes(trigger.longitude),
                  true
                )
              )}
              .
            </span>

            <span>
              Distância <strong>(B - C)</strong>: {distanceString}.
            </span>
            <span>
              Projetado em{" "}
              <strong>(A) {projectionPoint.name}: A + B - C =</strong>
              <br />
              {projectedLongitudeString}
              {" = "}
              {formatSignColor(getDegreeAndSign(projectedLongitude, true))}.
            </span>
            <span>Distância pro Ascendente: {distanceString}.</span>
          </div>
        </div>
      </div>
    );
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
          <h3 className="w-full text-[0.8rem] text-center mb-1">
            (Valores captados do mapa natal)
          </h3>

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full flex flex-row gap-2">
              <ArabicPartCalculatorDropdown
                label="(A) Origem:"
                onSelect={(el) => selectItem(el, 0)}
              />
              +
              <ArabicPartCalculatorDropdown
                label="(B) Até:"
                onSelect={(el) => selectItem(el, 1)}
              />
              -
              <ArabicPartCalculatorDropdown
                label="(C) De:"
                onSelect={(el) => selectItem(el, 2)}
              />
            </div>

            <button
              className="bg-blue-800 w-1/2 text-white px-4 py-1 rounded hover:bg-blue-900"
              onClick={() => {
                calculateLot();
                setShowLotCalculation(true);
              }}
            >
              Calcular
            </button>
          </div>

          {showLotCalculation && <div>{lotCalculationHTML}</div>}
        </div>
      </div>
    </div>
  );
}
