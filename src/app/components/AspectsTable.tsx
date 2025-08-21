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
import AspectTableFilterButton, {
  AspectFilterButtonImperativeHandle,
} from "./AspectTableFilterButton";
import {
  AspectDistance,
  AspectTableColumn,
  AspectDistanceType,
  ElementLongitudeParameterType,
  TableFilterOptions,
  AspectFilterOptions,
} from "@/interfaces/AspectTableInterfaces";

/**
 * Próximos passos:
 * 1 - Diferenciar elementos do mapa externo do mapa interno; (Ok)
 * 2 - Diferenciar tipo de aspecto entre aplicativo ou separativo; (Ok)
 * 3 - Inserir paginação; (Ok)
 * 4 - Inserir opção de filtro por: elemento, aspecto, elemento aspectado,
 *     mapa interno ou externo, distância, e tipo de aspecto (aplicativo ou separativo)
 *     4.1 - Só permitir um modal de pesquisa aberto por vez.
 */

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
  const aspectButtonRef = useRef<AspectFilterButtonImperativeHandle | null>(
    null
  );

  const backupValue = useRef(0);

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const [tablePageCount, setTablePageCount] = useState(1);
  const [filteredAspects, setFilteredAspects] = useState<PlanetAspectData[]>(
    []
  );
  const [filterModalIsOpenArray, setFilterModalIsOpenArray] = useState([
    false, // Element
    false, // Aspect
    false, // Aspected
    false, // Distance
    false, // DistanceType
  ]);

  const distanceValues: AspectDistance[] = [];
  const distanceTypes: AspectDistanceType[] = [];

  const tdClasses =
    "w-full border-r-2 flex flex-row items-center justify-center";

  useEffect(() => {
    setFilteredAspects((prev) =>
      aspects.map((asp) => ({ ...asp } as PlanetAspectData))
    );
  }, [aspects]);

  useEffect(() => {
    if (filteredAspects.length > 0) {
      updateTablePaginationAndPageCount();
    }
  }, [filteredAspects]);

  function extractHouseNumber(input: string): number | null {
    const match = input.match(/-(1[0-2]|[1-9])$/);
    return match ? parseInt(match[1], 10) : null;
  }

  function getArabicPartKeyFromElement(
    element: AspectedElement
  ): keyof ArabicPartsType | undefined {
    const name = element.name
      .replace(`-${fixedNames.antiscionName}`, "")
      .replace(`${fixedNames.outerKeyPrefix}-`, "");

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

    const numericDistance = Number.parseFloat(
      decimalToDegreesMinutes(Math.abs(_1stSignLong - _2ndSignLong)).toFixed(2)
    );

    distanceValues.push({ key: aspect.key, distance: numericDistance });

    const distance = numericDistance.toString();

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

  function getAspectDistanceType(aspect: PlanetAspectData): string {
    const applicative = "A";
    const separative = "S";
    let result: string;

    if (
      aspect.element.elementType !== "planet" &&
      aspect.aspectedElement.elementType !== "planet"
    )
      result = applicative;

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
          result = separative;
        else result = applicative;
      }

      if (planetSmallestLongInfo?.type === fastestPlanet.name) {
        if (planetSmallestLongInfo.isRetrograde) result = separative;
        else result = applicative;
      } else {
        if (planetBiggestLongInfo?.isRetrograde) result = applicative;
        else result = separative;
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
        if (planetInfo.isRetrograde) result = separative;
        else result = applicative;
      } else {
        if (planetInfo?.isRetrograde) result = applicative;
        else result = separative;
      }
    }

    distanceTypes.push({
      key: aspect.key,
      type: result,
    });

    return result;
  }

  function updateTablePaginationAndPageCount() {
    let newPageCount = Math.floor(filteredAspects.length / itemsPerPage);
    newPageCount += filteredAspects.length % itemsPerPage > 0 ? 1 : 0;

    let newCurrentPage =
      newPageCount > tablePageCount ? tablePageCount : newPageCount;
    setTablePageCount(newPageCount);
    setTableCurrentPage(newCurrentPage);
  }

  function updateTablePageCount(newItemsPerPage: number) {
    let pageCount = Math.floor(filteredAspects.length / newItemsPerPage);
    pageCount += filteredAspects.length % newItemsPerPage > 0 ? 1 : 0;
    setTablePageCount(pageCount);
  }

  function getLastRowItemCount(): number {
    return filteredAspects.length - (tableCurrentPage - 1) * itemsPerPage;
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

  function getColumnAspectedElements(
    column: "element" | "aspectedElement"
  ): AspectedElement[] {
    let elements: AspectedElement[] = [];

    if (column === "element") {
      elements = filteredAspects.map((aspect) => {
        return aspect.element;
      });
    } else if (column === "aspectedElement") {
      elements = filteredAspects.map((aspect) => {
        return aspect.aspectedElement;
      });
    }

    return elements;
  }

  const toggleFilterModalOpeningArray = (modalIndex: number) =>
    filterModalIsOpenArray.map((filterIsOpen, index) => {
      if (index === modalIndex) return !filterIsOpen;
      else return filterIsOpen;
    });

  function toggleFilterModalOpening(modalIndex: number) {
    let newArrayData = toggleFilterModalOpeningArray(modalIndex);

    const hasOtherModalOpen = newArrayData.some(
      (filterIsOpen, index) => modalIndex !== index && filterIsOpen
    );

    if (newArrayData[modalIndex] && !hasOtherModalOpen) {
      setFilterModalIsOpenArray(newArrayData);
    } else if (!newArrayData[modalIndex]) {
      newArrayData = toggleFilterModalOpeningArray(modalIndex); // Reseting modal opening to false
      setFilterModalIsOpenArray(newArrayData);
    }
  }

  function disableFilter(modalIndex: number): boolean {
    const hasOtherModalOpen = filterModalIsOpenArray.some(
      (filterIsOpen, index) => modalIndex !== index && filterIsOpen
    );

    return hasOtherModalOpen;
  }

  function handleOnConfirmFilter(options?: TableFilterOptions) {
    if (options?.aspectsFilter) {
      const cb = options.aspectsFilter.checkboxesStates;
      if (!cb.length) {
        setFilteredAspects([]);
        return;
      }

      const checkedAspects = new Set(
        cb.filter((c) => c.isChecked).map((c) => c.aspect)
      );

      setFilteredAspects(
        aspects.filter((asp) => checkedAspects.has(asp.aspectType))
      );
    }
  }

  function clearFilters() {
    aspectButtonRef.current?.clearFilter();
    setFilteredAspects([...aspects]);
  }

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Aspectos:</h2>

      <table className="w-full flex flex-col border-2 text-sm text-center">
        <thead>
          <tr className="flex flex-row justify-between">
            <th className="w-full text-center border-r-2">Elemento</th>
            <th className="w-full text-center border-r-2">Aspecto</th>
            <th className="w-full text-center border-r-2">Aspectado</th>
            <th className="w-full text-center border-r-2">Distância</th>
            <th className="w-3/4 text-center">Tipo</th>
          </tr>
          <tr className="flex flex-row items-center justify-between border-t-2">
            <th className="w-full h-full text-center border-r-2 text-[0.85rem]">
              <AspectTableFilterButton
                column="element"
                openModal={filterModalIsOpenArray[0]}
                modalIndex={0}
                disableFilterBtn={disableFilter(0)}
                elements={getColumnAspectedElements("element")}
                onModalButtonClick={toggleFilterModalOpening}
                onConfirm={handleOnConfirmFilter}
              />
            </th>
            <th className="w-full text-center border-r-2">
              <AspectTableFilterButton
                ref={aspectButtonRef}
                column="aspect"
                openModal={filterModalIsOpenArray[1]}
                modalIndex={1}
                disableFilterBtn={disableFilter(1)}
                onModalButtonClick={toggleFilterModalOpening}
                onConfirm={handleOnConfirmFilter}
              />
            </th>
            <th className="w-full text-center border-r-2">
              <AspectTableFilterButton
                column="aspectedElement"
                openModal={filterModalIsOpenArray[2]}
                modalIndex={2}
                disableFilterBtn={disableFilter(2)}
                elements={getColumnAspectedElements("aspectedElement")}
                onModalButtonClick={toggleFilterModalOpening}
                onConfirm={handleOnConfirmFilter}
              />
            </th>
            <th className="w-full text-center border-r-2">
              <AspectTableFilterButton
                column="distance"
                openModal={filterModalIsOpenArray[3]}
                modalIndex={3}
                disableFilterBtn={disableFilter(3)}
                distanceValues={distanceValues}
                onModalButtonClick={toggleFilterModalOpening}
                onConfirm={handleOnConfirmFilter}
              />
            </th>
            <th className="w-3/4 text-center">
              <AspectTableFilterButton
                column="aspectDistanceType"
                openModal={filterModalIsOpenArray[4]}
                modalIndex={4}
                disableFilterBtn={disableFilter(4)}
                distanceTypes={distanceTypes}
                onModalButtonClick={toggleFilterModalOpening}
                onConfirm={handleOnConfirmFilter}
              />
            </th>
          </tr>
        </thead>
        {filteredAspects && filteredAspects.length > 0 && (
          <tbody className="flex flex-col border-b-2">
            {filteredAspects
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
                    <td className={tdClasses}>
                      {getAspectImage(aspect.aspectType)}
                    </td>
                    <td className={tdClasses}>
                      {getElementImage(aspect.aspectedElement)}
                    </td>
                    <td className={tdClasses}>{getAspectDistance(aspect)}</td>
                    <td className="w-3/4">{getAspectDistanceType(aspect)}</td>
                  </tr>
                );
              })}

            {getEmptyTableRows()}
          </tbody>
        )}

        {(filteredAspects === undefined || filteredAspects.length === 0) && (
          <tbody className="flex flex-col border-y-2">
            <tr className="flex flex-row">
              <td className="w-full">Nenhum aspecto encontrado.</td>
            </tr>
          </tbody>
        )}
        <tfoot className="h-7 flex flex-row items-center justify-around p-2 font-bold">
          <tr className="w-full flex flex-row justify-between">
            <td>
              <span>Ítens por página&nbsp;</span>
              <select
                value={itemsPerPage}
                className="border-2"
                onChange={(e) => {
                  updateTableItemsPerPage(Number.parseInt(e.target.value));
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </td>

            <td className="flex flex-row items-center ml-1">
              <button
                className="hover:outline-2 outline-offset-[-1px] p-1 active:bg-gray-200"
                onClick={() => clearFilters()}
                title="Limpar Filtros"
              >
                <img src="trash.png" width={15} height={15} />
              </button>
            </td>

            <td className="flex flex-row items-center justify-center">
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
    </div>
  );
}
