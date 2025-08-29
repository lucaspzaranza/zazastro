"use client";

import {
  AspectTableColumn,
  ElementFilterModalCheckboxState,
  ElementFilterNode,
  FilterModalImperativeHandle,
  FilterModalProps,
  TableFilterOptions,
} from "@/interfaces/AspectTableInterfaces";
import {
  AspectedElement,
  ChartElement,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import AspectTableFilterModalLayout from "./AspectTableFilterModalLayout";
import {
  allElements,
  arabicParts,
  arabicPartsAntiscion,
  fixedStar,
  houses,
  outerArabicParts,
  outerArabicPartsAntiscion,
  outerHouses,
  outerPlanets,
  outerPlanetsAntiscion,
  planets,
  planetsAntiscion,
} from "@/app/utils/aspectTableUtils";

interface ExtendedFilterModalProps extends FilterModalProps {
  columnType: "element" | "aspectedElement";
  getElementImage?: (element: AspectedElement) => React.ReactNode;
}

function ElementFilterModalFn(
  props: ExtendedFilterModalProps,
  ref: React.ForwardedRef<FilterModalImperativeHandle>
) {
  const {
    isVisible,
    columnType,
    memorizedOptions,
    initialState,
    className,
    onCancel,
    onConfirm,
    applyFilterIsActiveClasses,
    getElementImage,
  } = props;

  const [useInnerChartElements, setUseInnerChartElements] = useState(true);
  const [useOuterChartElements, setUseOuterChartElements] = useState(true);

  const [useInnerPlanets, setUseInnerPlanets] = useState(true);
  const [useInnerPlanetsAntiscion, setUseInnerPlanetsAntiscion] =
    useState(true);
  const [useInnerArabicParts, setUseInnerArabicParts] = useState(true);
  const [useInnerArabicPartsAntiscion, setUseInnerArabicPartsAntiscion] =
    useState(true);
  const [useInnerHouses, setUseInnerHouses] = useState(true);

  const [useOuterPlanets, setUseOuterPlanets] = useState(true);
  const [useOuterPlanetsAntiscion, setUseOuterPlanetsAntiscion] =
    useState(true);
  const [useOuterArabicParts, setUseOuterArabicParts] = useState(true);
  const [useOuterArabicPartsAntiscion, setUseOuterArabicPartsAntiscion] =
    useState(true);
  const [useOuterHouses, setUseOuterHouses] = useState(true);

  function getElements(): AspectedElement[] {
    // console.log(
    //   `getElements with ${useInnerChartElements} and ${useOuterChartElements}`
    // );

    let result: AspectedElement[] = [];

    if (useInnerChartElements) {
      if (useInnerPlanets) result = planets.map((planet) => ({ ...planet }));

      if (useInnerArabicParts) {
        result = [...result, ...arabicParts.map((lot) => ({ ...lot }))];
      }

      if (useInnerPlanetsAntiscion) {
        result = [
          ...result,
          ...planetsAntiscion.map((planet) => ({ ...planet })),
        ];
      }

      if (useInnerArabicPartsAntiscion) {
        result = [
          ...result,
          ...arabicPartsAntiscion.map((planet) => ({ ...planet })),
        ];
      }

      if (useInnerHouses) {
        result = [...result, ...houses.map((planet) => ({ ...planet }))];
      }
    }

    if (useOuterChartElements) {
      if (useOuterPlanets)
        result = [...result, ...outerPlanets.map((planet) => ({ ...planet }))];

      if (useOuterArabicParts) {
        result = [...result, ...outerArabicParts.map((lot) => ({ ...lot }))];
      }

      if (useOuterPlanetsAntiscion) {
        result = [
          ...result,
          ...outerPlanetsAntiscion.map((planet) => ({ ...planet })),
        ];
      }

      if (useOuterArabicPartsAntiscion) {
        result = [
          ...result,
          ...outerArabicPartsAntiscion.map((planet) => ({ ...planet })),
        ];
      }

      if (useOuterHouses) {
        result = [...result, ...outerHouses.map((planet) => ({ ...planet }))];
      }
    }

    if (columnType === "aspectedElement") {
      result.push(fixedStar);
    }

    return result;
  }

  const [elements, setElements] = useState<AspectedElement[]>(getElements());

  const defaultCheckboxes = useMemo<ElementFilterModalCheckboxState[]>(
    () => allElements.map((el) => ({ element: el, isChecked: true })),
    []
  );

  const initialSnapshotRef = useRef<ElementFilterModalCheckboxState[]>(
    defaultCheckboxes.map((c) => ({ ...c }))
  );

  const [checkboxesChecked, setCheckboxesChecked] = useState<
    ElementFilterModalCheckboxState[]
  >(initialSnapshotRef.current.map((c) => ({ ...c })));

  const [allCheckboxesChecked, setAllCheckboxesChecked] = useState(true);
  const [elementNodes, setElementNodes] = useState<React.ReactNode[]>([]);

  const getOption = () =>
    columnType === "element" ? "elementsFilter" : "aspectedElementsFilter";

  useEffect(() => {
    const source =
      memorizedOptions?.[getOption()]?.elements ??
      initialState?.[getOption()]?.elements ??
      defaultCheckboxes;

    const clonedInitial = source.map((c) => ({ ...c }));

    initialSnapshotRef.current = clonedInitial;
    setCheckboxesChecked(clonedInitial.map((c) => ({ ...c })));
    setAllCheckboxesChecked(clonedInitial.every((c) => c.isChecked));

    setElementNodes(elements.map((element) => getElementImage?.(element)));
  }, [memorizedOptions, initialState]);

  useEffect(() => {
    const elementsToSet = getElements();

    setElements(elementsToSet);
    setElementNodes(elementsToSet.map((element) => getElementImage?.(element)));
  }, [
    useInnerChartElements,
    useInnerPlanets,
    useInnerPlanetsAntiscion,
    useInnerArabicParts,
    useInnerArabicPartsAntiscion,
    useInnerHouses,
    useOuterChartElements,
    useOuterPlanets,
    useOuterPlanetsAntiscion,
    useOuterArabicParts,
    useOuterArabicPartsAntiscion,
    useOuterHouses,
  ]);

  function resetAllCheckboxes() {
    setUseInnerChartElements(true);
    setUseInnerPlanets(true);
    setUseInnerPlanetsAntiscion(true);
    setUseInnerArabicParts(true);
    setUseInnerArabicPartsAntiscion(true);
    setUseInnerHouses(true);

    setUseOuterChartElements(true);
    setUseOuterPlanets(true);
    setUseOuterPlanetsAntiscion(true);
    setUseOuterArabicParts(true);
    setUseOuterArabicPartsAntiscion(true);
    setUseOuterHouses(true);
  }

  useImperativeHandle(
    ref,
    () => ({
      clearFilterModalFields() {
        setCheckboxesChecked((prev) =>
          prev.map((c) => ({ ...c, isChecked: true }))
        );
        setAllCheckboxesChecked(true);
        resetAllCheckboxes();
      },

      getOptions() {
        const propName = getOption();
        const options: TableFilterOptions = {
          elementsFilter:
            propName === "elementsFilter" ? { elements: [] } : undefined,
          aspectedElementsFilter:
            propName === "aspectedElementsFilter"
              ? { elements: [] }
              : undefined,
        };
        options[getOption()]!.elements = checkboxesChecked.map((c) => ({
          ...c,
        }));

        return options;
      },
    }),
    [checkboxesChecked]
  );

  const toggleSingleCheckbox = (index: number) => {
    if (allCheckboxesChecked) {
      toggleAllCheckboxes();
    }

    setCheckboxesChecked((prev) => {
      const next = prev.map((c, i) =>
        i === index ? { ...c, isChecked: !c.isChecked } : c
      );
      setAllCheckboxesChecked(next.every((c) => c.isChecked));
      return next;
    });
  };

  const toggleAllCheckboxes = () => {
    const newValue = !allCheckboxesChecked;
    setCheckboxesChecked((prev) =>
      prev.map((c) => ({ ...c, isChecked: newValue }))
    );
    setAllCheckboxesChecked(newValue);
  };

  function checkIfFilterIsActive(): boolean {
    return !allCheckboxesChecked;
  }

  function confirmWithAspectesChecked() {
    const propName = getOption();
    const options: TableFilterOptions = {
      elementsFilter:
        propName === "elementsFilter" ? { elements: [] } : undefined,
      aspectedElementsFilter:
        propName === "aspectedElementsFilter" ? { elements: [] } : undefined,
    };

    options[propName]!.elements = checkboxesChecked.map((c) => ({
      ...c,
    }));

    onConfirm?.(options);
    applyFilterIsActiveClasses?.(checkIfFilterIsActive());
  }

  function cancelAndResetState() {
    const original = initialSnapshotRef.current.map((c) => ({ ...c }));
    setCheckboxesChecked(original);
    setAllCheckboxesChecked(original.every((c) => c.isChecked));

    const propName = getOption();
    const options: TableFilterOptions = {
      elementsFilter:
        propName === "elementsFilter" ? { elements: [] } : undefined,
      aspectedElementsFilter:
        propName === "aspectedElementsFilter" ? { elements: [] } : undefined,
    };
    options[propName]!.elements = original.map((c) => ({
      ...c,
    }));
    onCancel?.(options);
  }

  return (
    <AspectTableFilterModalLayout
      isVisible={isVisible}
      title="Filtrar por Elemento"
      onCancel={cancelAndResetState}
      onConfirm={confirmWithAspectesChecked}
      className={`w-[630px] ${className}`}
    >
      {/* <div>
        <h2 className="text-sm">Opções</h2>
        <div className="w-full px-2 pt-1 pb-0 flex flex-row justify-between">
          <div className="w-1/2 flex flex-col">
            <div className="flex flex-row items-center gap- mb-2">
              <input
                type="checkbox"
                id="useInnerElements"
                checked={useInnerChartElements}
                onChange={() => setUseInnerChartElements((prev) => !prev)}
              />
              <label htmlFor="useInnerElements">Elementos Internos</label>
            </div>

            {useInnerChartElements && (
              <div className="w-full flex flex-col gap-1">
                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="setUseInnerPlanets"
                    checked={useInnerPlanets}
                    onChange={() => setUseInnerPlanets((prev) => !prev)}
                  />
                  <label htmlFor="setUseInnerPlanets">Planetas</label>
                </div>

                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="setUseInnerArabicParts"
                    checked={useInnerArabicParts}
                    onChange={() => setUseInnerArabicParts((prev) => !prev)}
                  />
                  <label htmlFor="setUseInnerArabicParts">Partes Árabes</label>
                </div>

                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="setUseInnerPlanetsAntiscion"
                    checked={useInnerPlanetsAntiscion}
                    onChange={() =>
                      setUseInnerPlanetsAntiscion((prev) => !prev)
                    }
                  />
                  <label htmlFor="setUseInnerPlanetsAntiscion">
                    Planetas (Antiscion)
                  </label>
                </div>

                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="setUseInnerArabicPartsAntiscion"
                    checked={useInnerArabicPartsAntiscion}
                    onChange={() =>
                      setUseInnerArabicPartsAntiscion((prev) => !prev)
                    }
                  />
                  <label htmlFor="setUseInnerArabicPartsAntiscion">
                    Pts Árabes (Antiscion)
                  </label>
                </div>

                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="setUseInnerHouses"
                    checked={useInnerHouses}
                    onChange={() => setUseInnerHouses((prev) => !prev)}
                  />
                  <label htmlFor="setUseInnerHouses">Casas</label>
                </div>
              </div>
            )}
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="flex flex-row gap-1 mb-2">
              <input
                type="checkbox"
                id="useOuterElements"
                checked={useOuterChartElements}
                onChange={() => setUseOuterChartElements((prev) => !prev)}
              />
              <label htmlFor="useOuterElements">Elementos Externos (E)</label>
            </div>

            {useOuterChartElements && (
              <div className="w-full flex flex-col gap-1">
                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="useOuterPlanets"
                    checked={useOuterPlanets}
                    onChange={() => setUseOuterPlanets((prev) => !prev)}
                  />
                  <label htmlFor="useOuterPlanets">Planetas</label>
                </div>

                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="useOuterArabicParts"
                    checked={useOuterArabicParts}
                    onChange={() => setUseOuterArabicParts((prev) => !prev)}
                  />
                  <label htmlFor="useOuterArabicParts">Partes Árabes</label>
                </div>

                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="useOuterPlanetsAntiscion"
                    checked={useOuterPlanetsAntiscion}
                    onChange={() =>
                      setUseOuterPlanetsAntiscion((prev) => !prev)
                    }
                  />
                  <label htmlFor="useOuterPlanetsAntiscion">
                    Planetas (Antiscion)
                  </label>
                </div>

                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="useOuterArabicPartsAntiscion"
                    checked={useOuterArabicPartsAntiscion}
                    onChange={() =>
                      setUseOuterArabicPartsAntiscion((prev) => !prev)
                    }
                  />
                  <label htmlFor="useOuterArabicPartsAntiscion">
                    Pts Árabes (Antiscion)
                  </label>
                </div>

                <div className="w-full flex flex-row gap-1 items-center">
                  <input
                    type="checkbox"
                    id="useOuterHouses"
                    checked={useOuterHouses}
                    onChange={() => setUseOuterHouses((prev) => !prev)}
                  />
                  <label htmlFor="useOuterHouses">Casas</label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div> */}

      {checkboxesChecked && (
        <div className="w-full grid grid-cols-7 gap-2 p-2">
          {elementNodes.map((node, index) => (
            <div
              key={index}
              className="flex flex-row items-center justify-start gap-1"
            >
              <input
                type="checkbox"
                id={`aspect-${index}`}
                checked={checkboxesChecked[index]?.isChecked ?? false}
                onChange={() => toggleSingleCheckbox(index)}
              />
              <label htmlFor={`aspect-${index}`}>{node}</label>
            </div>
          ))}

          {(useInnerChartElements || useOuterChartElements) && (
            <div className="flex flex-row items-center justify-start gap-1">
              <input
                type="checkbox"
                id="aspect-all"
                checked={allCheckboxesChecked}
                onChange={toggleAllCheckboxes}
              />
              <label htmlFor="aspect-all">Todos</label>
            </div>
          )}
        </div>
      )}
    </AspectTableFilterModalLayout>
  );
}

const ElementFilterModal = forwardRef<
  FilterModalImperativeHandle,
  ExtendedFilterModalProps
>(ElementFilterModalFn);
ElementFilterModal.displayName = "ElementFilterModal";

export default ElementFilterModal;
