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
  fixedNames,
  getArabicPartImage,
  getAspectImage,
  getDegreesInsideASign,
  getPlanetImage,
} from "../utils/chartUtils";
import {
  BirthChart,
  Planet,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { useBirthChart } from "@/contexts/BirthChartContext";

/**
 * Próximos passos:
 * 1 - Diferenciar elementos do mapa externo do mapa interno; (Ok)
 * 2 - Diferenciar tipo de aspecto entre aplicativo ou separativo;
 * 3 - Inserir paginação;
 * 4 - Inserir opção de filtro por: elemento, aspecto, elemento aspectado,
 *     mapa interno ou externo, distância, e tipo de aspecto (aplicativo ou separativo)
 */

type ElementLongitudeParameterType = "smallest" | "biggest";

export default function AspectsTable({
  aspects,
  birthChart,
  outerChart,
  arabicParts,
  outerArabicParts,
}: {
  aspects: PlanetAspectData[];
  birthChart: BirthChart;
  outerChart?: BirthChart;
  arabicParts: ArabicPartsType;
  outerArabicParts?: ArabicPartsType;
}) {
  const backupValue = useRef(0);

  const tdClasses =
    "w-full border-r-2 flex flex-row items-center justify-center";

  function extractHouseNumber(input: string): number | null {
    const match = input.match(/-(1[0-2]|[1-9])$/);
    return match ? parseInt(match[1], 10) : null;
  }

  function getArabicPartKeyFromElement(
    element: AspectedElement
  ): keyof ArabicPartsType | undefined {
    const name = element.isAntiscion
      ? element.name.replace(fixedNames.antiscionName, "")
      : element.name;
    const key = name as keyof ArabicPartsType;

    return key;
  }

  function getHouseName(element: AspectedElement): string {
    if (element.elementType !== "house") return "-";
    const houseNumber = extractHouseNumber(element.name)! + 1; // 0 - 11 to 1 - 12

    if ((houseNumber - 1) % 3 === 0) {
      return `${angularLabels[houseNumber - 1]}${
        element.isFromOuterChart ? "(E)" : ""
      }`;
    }

    return `C${houseNumber}${element.isFromOuterChart ? "(E)" : ""}`;
  }

  function getElementImage(element: AspectedElement): React.ReactNode {
    if (element.elementType === "planet") {
      return (
        <>
          {getPlanetImage(element.name as PlanetType, {
            isAntiscion: element.isAntiscion,
          })}
          {element.isFromOuterChart ? "(E)" : ""}
        </>
      );
    }

    if (element.elementType === "arabicPart" && arabicParts) {
      const key = getArabicPartKeyFromElement(element)!;
      const arabicPart = arabicParts[key];
      if (arabicPart) {
        return (
          <>
            {getArabicPartImage(arabicPart, {
              isAntiscion: element.isAntiscion,
            })}
            {element.isFromOuterChart ? "(E)" : ""}
          </>
        );
      }
    }

    if (element.elementType === "house") {
      return getHouseName(element);
    }

    // return <span>-</span>;
    return <span className="text-sm">{element.name}</span>;
  }

  function getPlanetInfo(element: AspectedElement): Planet | undefined {
    const chart = element.isFromOuterChart ? outerChart : birthChart;

    return chart?.planets.find(
      (planet) => planet.type === (element.name as PlanetType)
    );
  }

  function getElementRawLongitude(element: AspectedElement): number {
    let rawLongitude = 0;

    const chart = element.isFromOuterChart ? outerChart : birthChart;
    const lots = element.isFromOuterChart ? outerArabicParts : arabicParts;

    if (element.elementType === "planet") {
      const originalElement = getPlanetInfo(element);

      if (originalElement) {
        backupValue.current = element.isAntiscion
          ? originalElement.antiscionRaw
          : originalElement.longitudeRaw;
      }
    } else if (element.elementType === "house") {
      let houseIndex = extractHouseNumber(element.name)! + 1;

      if (chart) {
        const index = houseIndex - 1;
        backupValue.current = chart.housesData.house[index];
        // console.log(
        //   `element: ${element.name}, houseIndex: ${houseIndex}, array index: ${index}, rawLong: ${backupValue.current},`
        // );
      }
    } else if (element.elementType === "arabicPart") {
      // if (element.isAntiscion) {
      //   console.log(`element: ${element.name}, rawLong: ${rawLongitude}`);
      // }

      const key = getArabicPartKeyFromElement(element)!;
      if (lots) {
        const originalArabicPart = lots[key];
        if (originalArabicPart) {
          backupValue.current = element.isAntiscion
            ? originalArabicPart.antiscionRaw
            : originalArabicPart.longitudeRaw;
        }
      }
    }

    rawLongitude = backupValue.current;
    backupValue.current = 0;

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

    // if (
    //   aspect.aspectType === "conjunction" &&
    //   aspect.element.name.includes("saturn") &&
    //   !aspect.aspectedElement.isFromOuterChart
    // ) {
    //   console.log(
    //     `1st: ${_1stSignLong}, 2nd raw: ${_2ndElementRawLongitude}, 2nd: ${_2ndSignLong}`
    //   );
    // }

    const distance = decimalToDegreesMinutes(
      Math.abs(_1stSignLong - _2ndSignLong)
    )
      .toFixed(2)
      .toString();

    const parts = distance.split(".");
    const deg = parts[0];
    let min = parts[1];

    // if (
    //   distance === "24.10" &&
    //   aspect.element.name.includes("saturn") &&
    //   !aspect.aspectedElement.isFromOuterChart &&
    //   aspect.aspectedElement.elementType === "house" &&
    //   aspect.aspectType === "conjunction"
    // ) {
    //   console.log(
    //     ` aspect: ${aspect.aspectType},
    //     1st: ${aspect.element.name} - ${_1stSignLong},
    //      2nd: ${aspect.aspectedElement.name} - ${_2ndSignLong}, distance: ${distance}`
    //   );
    //   // console.log(aspect);
    //   // console.log(parts);
    //   console.log("birthChart", birthChart);
    //   console.log("outerChart", outerChart);
    //   console.log(aspect);
    //   console.log(aspects);
    // }

    if (min && min.length === 1) {
      min = min + "0";
    }

    return `${deg}°${min ?? "00"}'`;
  }

  function getFastestPlanetFromAspect(
    aspect: PlanetAspectData
  ): AspectedElement {
    const firstIndex = caldaicOrder.findIndex(
      (planet) => planet === (aspect.element.name as PlanetType)
    );

    const secondIndex = caldaicOrder.findIndex(
      (planet) => planet === (aspect.aspectedElement.name as PlanetType)
    );

    if (secondIndex < firstIndex) return aspect.aspectedElement;

    return aspect.element;
  }

  /**
   * Get element from aspect with the smallest or biggest longitude.
   */
  function getElementWithLongitudeFromAspect(
    aspect: PlanetAspectData,
    smallestOrBiggest: ElementLongitudeParameterType
  ): AspectedElement {
    const _1stSignLong = getDegreesInsideASign(
      getElementRawLongitude(aspect.element)
    );

    const _2ndSignLong = getDegreesInsideASign(
      getElementRawLongitude(aspect.aspectedElement)
    );

    const matchSecondElementLogic =
      smallestOrBiggest === "smallest"
        ? _2ndSignLong < _1stSignLong
        : _2ndSignLong > _1stSignLong;

    if (matchSecondElementLogic) return aspect.aspectedElement;

    return aspect.element;
  }

  function getPlanetFromAspect(aspect: PlanetAspectData): AspectedElement {
    if (aspect.element.elementType === "planet") return aspect.element;

    return aspect.aspectedElement;
  }

  function getAspectType(aspect: PlanetAspectData): string {
    const applicative = "A";
    const separative = "S";

    if (
      aspect.element.elementType !== "planet" &&
      aspect.aspectedElement.elementType !== "planet"
    )
      return applicative;

    if (
      aspect.element.elementType === "planet" &&
      aspect.aspectedElement.elementType === "planet"
    ) {
      const fastestPlanet = getFastestPlanetFromAspect(aspect);
      const planetSmallestLongInfo = getPlanetInfo(
        getElementWithLongitudeFromAspect(aspect, "smallest")
      );

      const planetBiggestLongInfo = getPlanetInfo(
        getElementWithLongitudeFromAspect(aspect, "biggest")
      );

      if (
        planetSmallestLongInfo?.isRetrograde &&
        planetBiggestLongInfo?.isRetrograde
      ) {
        if (planetSmallestLongInfo.type === fastestPlanet.name)
          return separative;
        else return applicative;
      }

      if (planetSmallestLongInfo?.type === fastestPlanet.name) {
        if (planetSmallestLongInfo.isRetrograde) return separative;
        else return applicative;
      } else {
        if (planetBiggestLongInfo?.isRetrograde) return applicative;
        else return separative;
      }
    } else {
      // planet w/ house or lot
      const planetFromAspect = getPlanetFromAspect(aspect);
      const planetInfo = getPlanetInfo(planetFromAspect);
      const elWithSmallestLong = getElementWithLongitudeFromAspect(
        aspect,
        "smallest"
      );

      if (planetInfo?.type === elWithSmallestLong.name) {
        if (planetInfo.isRetrograde) return separative;
        else return applicative;
      } else {
        if (planetInfo?.isRetrograde) return applicative;
        else return separative;
      }
    }
  }

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Aspectos:</h2>

      {aspects && aspects.length > 0 && (
        <table className="w-full flex flex-col border-2 text-sm text-center">
          <thead>
            <tr className="flex flex-row justify-between">
              <th className="w-full text-center border-r-2">Elemento</th>
              <th className="w-full text-center border-r-2">Aspecto</th>
              <th className="w-full text-center border-r-2">Aspectado</th>
              <th className="w-full text-center border-r-2">Distância</th>
              <th className="w-3/4 text-center">Tipo</th>
            </tr>
          </thead>
          <tbody className="flex flex-col">
            {aspects.map((aspect, index) => {
              return (
                <tr className="flex flex-row border-t-2" key={index}>
                  <td className={tdClasses}>
                    {getElementImage(aspect.element)}
                  </td>
                  <td className={tdClasses}>{getAspectImage(aspect)}</td>
                  <td className={tdClasses}>
                    {getElementImage(aspect.aspectedElement)}
                  </td>
                  <td className={tdClasses}>{getAspectDistance(aspect)}</td>
                  <td className="w-3/4">{getAspectType(aspect)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {(aspects === undefined || aspects.length === 0) && (
        <table className="w-full flex flex-col border-2 text-sm text-center">
          <thead className="border-b-2">
            <tr className="flex flex-row justify-between">
              <th className="w-full text-center border-r-2">Planeta</th>
              <th className="w-full text-center border-r-2">Aspecto</th>
              <th className="w-full text-center border-r-2">Aspectado</th>
              <th className="w-full text-center border-r-2">Distância</th>
              <th className="w-3/4 text-center">Tipo</th>
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
