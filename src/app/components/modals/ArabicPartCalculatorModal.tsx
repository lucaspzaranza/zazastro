import React, { useEffect, useState } from "react";
import ArabicPartCalculatorDropdown from "./ArabicPartCalculatorDropdown";
import {
  ArabicPartCalculatorDropdownItem,
  ArabicPartsType,
} from "@/interfaces/ArabicPartInterfaces";
import { ChartElementForArabicPartCalculation } from "@/interfaces/AstroChartInterfaces";
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
import { useChartMenu } from "@/contexts/ChartMenuContext";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";

interface ArabicPartCalculatorProps {
  onClose?: () => void;
}

export default function ArabicPartCalculatorModal(
  props: ArabicPartCalculatorProps
) {
  const { onClose } = props;

  const { isMobileBreakPoint } = useScreenDimensions();
  const { chartMenu } = useChartMenu();
  const { birthChart, returnChart, lunarDerivedChart } = useBirthChart();
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

  function getBirthArchAscendant(): number {
    if (chartMenu === "lunarDerivedReturn" && lunarDerivedChart)
      return lunarDerivedChart?.housesData.house[0];
    else if (returnChart) return returnChart.housesData.house[0];

    return 0;
  }

  function calculateLot(): void {
    if (!projectionPoint || !significator || !trigger) {
      setLotCalculationHTML(
        <div className="w-full text-sm text-center mt-2">
          Algum dos campos está vazio, por favor selecione os elementos para o
          cálculo.
        </div>
      );
      return;
    }

    const distance = mod360(significator?.longitude - trigger?.longitude);
    const distanceString = convertDecimalIntoDegMinString(
      decimalToDegreesMinutes(distance)
    );

    const rawProjectedLongitude = decimalToDegreesMinutes(
      projectionPoint.longitude + distance
    );
    const rawProjectedLongitudeString = convertDecimalIntoDegMinString(
      rawProjectedLongitude
    );
    const showModTransformation = rawProjectedLongitude > 360;

    const projectedLongitude = mod360(
      decimalToDegreesMinutes(projectionPoint.longitude + distance)
    );
    // const projectedLongitudeString = convertDecimalIntoDegMinString(
    //   decimalToDegreesMinutes(projectedLongitude)
    // );

    const archACRaw = getBirthArchAscendant();
    const archACString = convertDecimalIntoDegMinString(
      decimalToDegreesMinutes(archACRaw)
    );
    const archLotLongitudeRaw = decimalToDegreesMinutes(archACRaw + distance);
    const archLotLongitudeString = convertDecimalIntoDegMinString(
      Number.parseFloat(mod360(archLotLongitudeRaw).toFixed(2))
    );
    const showArchLotLongMod360Transformation = archLotLongitudeRaw > 360;

    setLotCalculationHTML(
      <div className="w-full text-center mt-2">
        {/* <strong> */}
        Parte Árabe está em{" "}
        {formatSignColor(getDegreeAndSign(projectedLongitude, true))}.
        {/* </strong> */}
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
              <strong>
                (A) {projectionPoint.name}: A + B - C{" = "}
              </strong>
              <br />
              {convertDecimalIntoDegMinString(
                decimalToDegreesMinutes(projectionPoint.longitude)
              )}{" "}
              (
              {formatSignColor(
                getDegreeAndSign(
                  decimalToDegreesMinutes(projectionPoint.longitude),
                  true
                )
              )}
              ) + {distanceString} ={" "}
              {showModTransformation && (
                <>
                  <br />
                  {rawProjectedLongitudeString} - 360° ={" "}
                </>
              )}
              {convertDecimalIntoDegMinString(
                Number.parseFloat(projectedLongitude.toFixed(2))
              )}
              {/* {convertDecimalIntoDegMinString(333.05)} */}
              {" = "}
              {formatSignColor(getDegreeAndSign(projectedLongitude, true))}.
            </span>
            <span>Distância pro Ascendente: {distanceString}.</span>

            {chartMenu !== "birth" && (
              <div className="w-full mt-1 flex flex-col">
                <h3 className="text-center text-[1rem]">
                  <strong>Parte Árabe projetada no Arco Natal:</strong>
                </h3>
                <span>
                  Ascendente: {archACString}
                  {" = "}
                  {formatSignColor(
                    getDegreeAndSign(decimalToDegreesMinutes(archACRaw), true)
                  )}
                  .
                </span>
                <span>
                  Parte projetada no Arco do Ascendente (AC do Arco + Distância
                  pro AC Natal) ={" "}
                  {showArchLotLongMod360Transformation && (
                    <>
                      {convertDecimalIntoDegMinString(archLotLongitudeRaw)} -
                      360° =&nbsp;
                    </>
                  )}
                  {archLotLongitudeString} ={" "}
                  {formatSignColor(getDegreeAndSign(archLotLongitudeRaw, true))}
                  .
                </span>

                <span className="w-full text-center text-[1rem] mt-1">
                  Parte Árabe do arco está em{" "}
                  {formatSignColor(getDegreeAndSign(archLotLongitudeRaw, true))}
                  .
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute w-full md:w-[30rem] h-[80vh] flex flex-row top-[-22%] items-center justify-start z-10 text-sm md:text-[1rem]">
      <div className={`w-full md:w-[41rem] min-h-[26rem] bg-white outline-2`}>
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
            <div className="w-full flex flex-row items-center justify-center gap-2">
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
