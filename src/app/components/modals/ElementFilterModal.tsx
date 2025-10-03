"use client";

import {
  ElementFilterModalCheckboxState,
  ElementFilterNode,
  FilterModalImperativeHandle,
  FilterModalProps,
  TableFilterOptions,
} from "@/interfaces/AspectTableInterfaces";
import { AspectedElement } from "@/interfaces/AstroChartInterfaces";
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
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";

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
    clearSignal,
  } = props;

  // const getUseOuterChartElements = () =>
  //   chartMenu !== "birth" &&
  //   returnChart !== undefined &&
  //   (isCombinedWithBirthChart || isCombinedWithReturnChart);

  const { returnChart, lunarDerivedChart, sinastryChart, progressionChart, isCombinedWithBirthChart, isCombinedWithReturnChart } =
    useBirthChart();
  const { chartMenu } = useChartMenu();

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

  const getUseOuterChartElements = (): boolean => {
    let result: boolean = false;

    if (chartMenu === "birth") return false;

    if (chartMenu === "solarReturn" || chartMenu === "lunarReturn")
      result = returnChart !== undefined && isCombinedWithBirthChart;

    if (chartMenu === "lunarDerivedReturn")
      result = lunarDerivedChart !== undefined && (isCombinedWithBirthChart || isCombinedWithReturnChart);

    if (chartMenu === "sinastry")
      result = sinastryChart !== undefined;

    if (chartMenu === "progression")
      result = progressionChart !== undefined && isCombinedWithBirthChart;

    return result;
  }

  const [useInnerChartElements, setUseInnerChartElements] = useState(true);
  const [useOuterChartElements, setUseOuterChartElements] = useState(
    getUseOuterChartElements()
  );

  function getElements(): AspectedElement[] {
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
  const [signalCleared, setSignalCleared] = useState(false);

  function elementAndNodeAreEquivalent(
    element: AspectedElement,
    node: ElementFilterNode
  ): boolean {
    return (
      element.elementType === node.elementType &&
      element.isAntiscion === node.isAntiscion &&
      element.isFromOuterChart === node.isFromOuterChart &&
      element.name === node.name
    );
  }

  const getOption = () =>
    columnType === "element" ? "elementsFilter" : "aspectedElementsFilter";

  useEffect(() => {
    if (typeof props.clearSignal === "number") {
      setSignalCleared(true);
    }
  }, [clearSignal]);

  useEffect(() => {
    if (signalCleared) {
      initialSnapshotRef.current = defaultCheckboxes.map((c) => ({ ...c }));

      resetAllCheckboxes();
      setAllCheckboxesChecked(true);
      setCheckboxesChecked((prev) =>
        prev.map((c) => ({ ...c, isChecked: true }))
      );

      setSignalCleared(false);
    }
  }, [signalCleared]);

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

    setCheckboxesChecked(
      checkboxesChecked.filter((checkbox) =>
        elementsToSet.some((elToSet) =>
          elementAndNodeAreEquivalent(elToSet, checkbox.element)
        )
      )
    );

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

    if (getUseOuterChartElements()) {
      setUseOuterChartElements(true);
      setUseOuterPlanets(true);
      setUseOuterPlanetsAntiscion(true);
      setUseOuterArabicParts(true);
      setUseOuterArabicPartsAntiscion(true);
      setUseOuterHouses(true);
    }
  }

  useImperativeHandle(
    ref,
    () => ({
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

  function confirmWithAspectsChecked() {
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
      onConfirm={confirmWithAspectsChecked}
      className={`w-[90vw] md:w-[630px] ${className}`}
    >
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
