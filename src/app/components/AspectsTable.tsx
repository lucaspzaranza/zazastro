import { useAspectsData } from "@/contexts/AspectsContext";
import {
  AspectedElement,
  ChartElement,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";
import React, { useEffect, useRef } from "react";
import {
  angularLabels,
  arabicPartKeys,
  caldaicOrder,
  decimalToDegreesMinutes,
  getArabicPartImage,
  getAspectImage,
  getDegreesInsideASign,
  getPlanetImage,
} from "../utils/chartUtils";
import { PlanetType } from "@/interfaces/BirthChartInterfaces";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useBirthChart } from "@/contexts/BirthChartContext";

export default function AspectsTable() {
  const { aspects } = useAspectsData();
  const { arabicParts, archArabicParts } = useArabicParts();
  const { birthChart, returnChart } = useBirthChart();
  const houseBackupValue = useRef(0);

  const tdClasses =
    "w-full border-r-1 flex flex-row items-center justify-center";

  function extractHouseNumber(input: string): number | null {
    const match = input.match(/-(1[0-2]|[1-9])$/);
    return match ? parseInt(match[1], 10) : null;
  }

  function getHouseName(element: AspectedElement): string {
    if (element.elementType !== "house") return "-";
    const houseNumber = extractHouseNumber(element.name)! + 1; // 0 - 11 to 1 - 12

    if ((houseNumber - 1) % 3 === 0) {
      return angularLabels[houseNumber - 1];
    }

    return `Casa ${houseNumber}`;
  }

  function getElementImage(element: AspectedElement): React.ReactNode {
    if (element.elementType === "planet") {
      return getPlanetImage(element.name as PlanetType);
    }

    if (element.elementType === "arabicPart" && arabicParts) {
      const key = element.name as keyof ArabicPartsType;
      const arabicPart = arabicParts[key];
      if (arabicPart) {
        return getArabicPartImage(arabicPart);
      }
    }

    if (element.elementType === "house") {
      return <span>{getHouseName(element)}</span>;
    }

    return <span>-</span>;
  }

  function getElementRawLongitude(element: AspectedElement): number {
    let rawLongitude = 0;

    const chart = element.isFromOuterChart ? returnChart : birthChart;
    const lots = element.isFromOuterChart ? archArabicParts : arabicParts;

    if (element.elementType === "planet") {
      const originalElement = chart?.planets.find(
        (planet) => planet.type === element.name
      );

      if (originalElement) rawLongitude = originalElement.longitudeRaw;
    } else if (element.elementType === "house") {
      let houseIndex = extractHouseNumber(element.name)! + 1;

      if (chart) {
        const index = houseIndex - 1;
        houseBackupValue.current = chart.housesData.house[index];
        console.log(
          `element: ${element.name}, houseIndex: ${houseIndex}, array index: ${index}, rawLong: ${houseBackupValue.current},`
        );
        // if (houseIndex + 1 === 12) {
        // }
      }

      rawLongitude = houseBackupValue.current;
    } else if (element.elementType === "arabicPart") {
      const key = element.name as keyof ArabicPartsType;
      if (lots) {
        const originalArabicPart = lots[key];
        rawLongitude = originalArabicPart?.longitudeRaw!;
      }
    }

    return rawLongitude;
  }

  function getAspectDistance(aspect: PlanetAspectData): string {
    const _1stElementRawLongitude = getElementRawLongitude(aspect.element);
    const _2ndElementRawLongitude = getElementRawLongitude(
      aspect.aspectedElement
    );
    const _1stSignLong = getDegreesInsideASign(_1stElementRawLongitude);
    const _2ndSignLong = getDegreesInsideASign(_2ndElementRawLongitude);

    // console.log(aspect.element.longitude - aspect.aspectedElement.longitude);

    if (
      aspect.aspectType === "trine" &&
      aspect.aspectedElement.elementType === "house"
    ) {
      console.log(
        `1st: ${_1stSignLong}, 2nd raw: ${_2ndElementRawLongitude}, 2nd: ${_2ndSignLong}`
      );
    }

    const distance = decimalToDegreesMinutes(
      Math.abs(_1stSignLong - _2ndSignLong)
    )
      .toFixed(2)
      .toString();

    const parts = distance.split(".");
    const deg = parts[0];
    let min = parts[1];

    if (min && min.length === 1) {
      min = min + "0";
    }

    return `${deg}°${min ?? "00"}'`;
    // return decimalToDegreesMinutes(distance);
  }

  function getAspectType(aspect: PlanetAspectData): string {
    // const elementIndex = caldaicOrder.indexOf(aspect.element.name as )
    return "";
  }

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Aspectos:</h2>

      {aspects && aspects.length > 0 && (
        <table className="w-full flex flex-col border-1 text-sm text-center">
          <thead>
            <tr className="flex flex-row justify-between">
              <th className="w-full text-center border-r-1">Elemento</th>
              <th className="w-full text-center border-r-1">Aspecto</th>
              <th className="w-full text-center border-r-1">Aspectado</th>
              <th className="w-full text-center border-r-1">Dist.</th>
              <th className="w-full text-center">Tipo</th>
            </tr>
          </thead>
          <tbody className="flex flex-col">
            {aspects.map((aspect, index) => {
              return (
                <tr className="flex flex-row border-t-1" key={index}>
                  <td className={tdClasses}>
                    {getElementImage(aspect.element)}
                  </td>
                  <td className={tdClasses}>{getAspectImage(aspect)}</td>
                  <td className={tdClasses}>
                    {getElementImage(aspect.aspectedElement)}
                  </td>
                  <td className={tdClasses}>{getAspectDistance(aspect)}</td>
                  <td className="w-full">A</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {(aspects === undefined || aspects.length === 0) && (
        <table className="w-full flex flex-col border-1 text-sm text-center">
          <thead className="border-b-1">
            <tr className="flex flex-row justify-between">
              <th className="w-full text-center border-r-1">Planeta</th>
              <th className="w-full text-center border-r-1">Aspecto</th>
              <th className="w-full text-center border-r-1">Aspectado</th>
              <th className="w-full text-center border-r-1">Dist.</th>
              <th className="w-full text-center">Tipo</th>
            </tr>
          </thead>
          <tbody className="flex flex-col">
            <tr className="flex flex-row">
              <td className="w-full">Mapa sem aspectos.</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
