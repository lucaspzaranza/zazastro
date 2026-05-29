import React, { useEffect, useState } from "react";
import ArabicPartCalculatorDropdown from "./modals/ArabicPartCalculatorDropdown";
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
import { useTranslations } from "next-intl";

export default function ArabicPartCalculator(

) {
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

  const t = useTranslations();

  useEffect(() => {
    if (!birthChart) return;

    const acElement: ChartElementForArabicPartCalculation = {
      name: "Ascendente",
      key: "1",
      elementType: "house",
      longitude: birthChart?.housesData.house[0],
    };

    setProjectionPoint(acElement);
    setSignificator(acElement);
    setTrigger(acElement);
  }, [birthChart]);

  useEffect(() => {
    if (showLotCalculation) {
      calculateLot();
    }
  }, [t]);

  function getElementFromChart(
    element: ArabicPartCalculatorDropdownItem
  ): ChartElementForArabicPartCalculation | undefined {
    let chartElement: ChartElementForArabicPartCalculation | undefined;

    if (element.type === "planet") {
      const planet = birthChart?.planets.find((p) => p.type === element.key);
      if (planet) {
        chartElement = {
          name: planet.type,
          key: "planets",
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
          name: element.name,
          key: (houseNumber + 1).toString(),
          elementType: "house",
          longitude: house,
        };
      }
    } else if (element.type === "arabicPart") {
      const key = element.key as keyof ArabicPartsType;
      if (!arabicParts) return undefined;

      const lot = arabicParts[key];
      if (!lot) return undefined;

      chartElement = {
        name: element.name,
        key,
        elementType: "arabicPart",
        longitude: lot.longitudeRaw,
      };
    }

    return chartElement;
  }

  function getLabel(item: ChartElementForArabicPartCalculation) {
    if (item.elementType === "planet") {
      return t(`planets.${item.name}`);
    }

    if (item.elementType === "house") {
      return t(`birthChart.house`) + " " + item.key;
    }

    if (item.elementType === "arabicPart") {
      return t(`arabicParts.${item.key}.short`);
    }

    return item.key;
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
        {t("arabicParts.lotIsIn")}
        {formatSignColor(getDegreeAndSign(projectedLongitude, true))}.
        <div className="w-full flex flex-col mt-2">
          <strong>{t("arabicParts.calculationDetails")}:</strong>
          <div className="flex flex-col text-start text-sm">
            <span>
              {t("arabicParts.significator")} <strong>(B)</strong>:{" "}
              <strong>{getLabel(significator)}</strong>
              {" "}{t("arabicParts.in")}{" "}
              {formatSignColor(
                getDegreeAndSign(
                  decimalToDegreesMinutes(significator.longitude),
                  true
                )
              )}
              .
            </span>

            <span>
              {t("arabicParts.trigger")} <strong>(C)</strong>: <strong>{getLabel(trigger)}</strong>
              {" "}{t("arabicParts.in")}{" "}
              {formatSignColor(
                getDegreeAndSign(
                  decimalToDegreesMinutes(trigger.longitude),
                  true
                )
              )}
              .
            </span>

            <span>
              {t("arabicParts.distance")} <strong>(B - C)</strong>: {distanceString}.
            </span>
            <span>
              {t("arabicParts.projectedIn")}{" "}
              <strong>
                (A) {getLabel(projectionPoint)}: A + B - C{" = "}
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
              {" = "}
              {formatSignColor(getDegreeAndSign(projectedLongitude, true))}.
            </span>
            <span>{t("arabicParts.distanceFromASC")}: {distanceString}.</span>

            {chartMenu !== "birth" && chartMenu !== "moment" && (
              <div className="w-full mt-1 flex flex-col">
                <h3 className="text-center text-[1rem]">
                  <strong>{t("arabicParts.projectedInBirthArch")}:</strong>
                </h3>
                <span>
                  {t("arabicParts.asc")}: {archACString}
                  {" = "}
                  {formatSignColor(
                    getDegreeAndSign(decimalToDegreesMinutes(archACRaw), true)
                  )}
                  .
                </span>
                <span>
                  {t("arabicParts.projectedLotInBirthArch")}{" "}
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
                  {t("arabicParts.projectedLotInBirthArch")}{" "}
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
    <div className="w-full md:min-h-[24.8rem] flex flex-col items-center justify-start text-sm md:text-[1rem] mb-3 md:mb-0">
      <h2 className="w-full text-center">
        {t("arabicParts.choosePoints")}:
      </h2>
      <h3 className="w-full italic text-[0.8rem] text-center mb-1">
        {t("arabicParts.valuesFromBirthChart")}
      </h3>

      <div className="w-full flex flex-col items-center justify-center gap-4">
        <div className="w-full flex flex-row items-center justify-center gap-2">
          <ArabicPartCalculatorDropdown
            label={t("arabicParts.origin")}
            onSelect={(el) => selectItem(el, 0)}
          />
          +
          <ArabicPartCalculatorDropdown
            label={t("arabicParts.until")}
            onSelect={(el) => selectItem(el, 1)}
          />
          -
          <ArabicPartCalculatorDropdown
            label={t("arabicParts.from")}
            onSelect={(el) => selectItem(el, 2)}
          />
        </div>

        <button
          className="default-btn w-1/2!"
          onClick={() => {
            calculateLot();
            setShowLotCalculation(true);
          }}
        >
          {/* Calcular */}
          {t("arabicParts.calculate")}
        </button>
      </div>

      {showLotCalculation && <div className="w-full">{lotCalculationHTML}</div>}
    </div>
  );
}
