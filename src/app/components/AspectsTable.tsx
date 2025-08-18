import { useAspectsData } from "@/contexts/AspectsContext";
import {
  AspectedElement,
  ChartElement,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";
import React, { useEffect, useRef, useState } from "react";
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
  monthsNames,
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
 * 2 - Diferenciar tipo de aspecto entre aplicativo ou separativo; (Ok)
 * 3 - Inserir paginação; (Ok)
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

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const [tablePageCount, setTablePageCount] = useState(1);

  const tdClasses =
    "w-full border-r-2 flex flex-row items-center justify-center";

  useEffect(() => {
    if (aspects.length > 0) {
      updateTablePaginationAndPageCount();
    }
  }, [aspects]);

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
      }
    } else if (element.elementType === "arabicPart") {
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

  function updateTablePaginationAndPageCount() {
    let newPageCount = Math.floor(aspects.length / itemsPerPage);
    newPageCount += aspects.length % itemsPerPage > 0 ? 1 : 0;

    let newCurrentPage =
      newPageCount > tablePageCount ? tablePageCount : newPageCount;
    setTablePageCount(newPageCount);
    setTableCurrentPage(newCurrentPage);
  }

  function updateTablePageCount(newItemsPerPage: number) {
    let pageCount = Math.floor(aspects.length / newItemsPerPage);
    pageCount += aspects.length % newItemsPerPage > 0 ? 1 : 0;
    setTablePageCount(pageCount);
  }

  function getLastRowItemCount(): number {
    return aspects.length - (tableCurrentPage - 1) * itemsPerPage;
  }

  function isLastPage(): boolean {
    return tableCurrentPage === tablePageCount;
  }

  function updateTableItemsPerPage(newItemsPerPage: number) {
    setItemsPerPage(newItemsPerPage);
    updateTablePageCount(newItemsPerPage);

    if (newItemsPerPage === itemsPerPage) return;

    let currentItemsShown = 0;
    let newTableCurrentPage = 0;

    if (newItemsPerPage > itemsPerPage) {
      currentItemsShown = tableCurrentPage * itemsPerPage;
    }

    const lastRowItemCount = getLastRowItemCount();

    currentItemsShown = isLastPage()
      ? itemsPerPage * (tableCurrentPage - 1) + lastRowItemCount
      : itemsPerPage;

    newTableCurrentPage = Math.floor(currentItemsShown / newItemsPerPage);
    newTableCurrentPage += currentItemsShown % newItemsPerPage > 0 ? 1 : 0;

    setTableCurrentPage(newTableCurrentPage);
  }

  function updateTableCurrentPage(direction: number) {
    if (direction < 0) {
      setTableCurrentPage((prev) => Math.max(1, prev + direction));
    } else {
      setTableCurrentPage((prev) => Math.min(prev + direction, tablePageCount));
    }
  }

  function getEmptyTableRows(): React.ReactNode {
    const lastRowItemCount = getLastRowItemCount();
    const emptyRowsCount = itemsPerPage - lastRowItemCount;
    const rows: React.ReactNode[] = [];

    for (let index = 0; index < emptyRowsCount; index++) {
      const trClasses = `flex flex-row border-t-2 ${
        index > 0 ? "border-white" : ""
      }`;
      rows.push(
        <tr key={index} className={trClasses}>
          <td>&nbsp;</td>
        </tr>
      );
    }

    return rows;
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
          <tbody className="flex flex-col border-b-2">
            {aspects
              .filter(
                (_, index) =>
                  index >= itemsPerPage * (tableCurrentPage - 1) &&
                  index < itemsPerPage * tableCurrentPage
              )
              .map((aspect, index) => {
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

            {getEmptyTableRows()}
          </tbody>
          <tfoot className="h-7 flex flex-row items-center justify-around p-2 font-bold">
            <tr className="w-full flex flex-row">
              <td className="mr-[-20px]">
                <span>Ítens por página&nbsp;</span>
                <select
                  value={itemsPerPage}
                  className="border-2 mr-10"
                  onChange={(e) => {
                    updateTableItemsPerPage(Number.parseInt(e.target.value));
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </td>

              <td className="w-[50px] flex flex-row items-center justify-center">
                {tableCurrentPage}/{tablePageCount}
              </td>

              <td className="flex flex-row gap-2">
                <button
                  className="border-2 w-[30px] hover:bg-gray-200 active:bg-gray-300"
                  onClick={() => updateTableCurrentPage(-999)}
                >
                  |◀
                </button>
                <button
                  className="border-2 w-[30px] hover:bg-gray-200 active:bg-gray-300"
                  onClick={() => updateTableCurrentPage(-1)}
                >
                  ◀
                </button>
                <button
                  className="border-2 w-[30px] hover:bg-gray-200 active:bg-gray-300"
                  onClick={() => updateTableCurrentPage(1)}
                >
                  ▶
                </button>
                <button
                  className="border-2 w-[30px] hover:bg-gray-200 active:bg-gray-300"
                  onClick={() => updateTableCurrentPage(999)}
                >
                  ▶|
                </button>
              </td>
            </tr>
          </tfoot>
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
