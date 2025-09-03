"use client";

import {
  AspectDistance,
  AspectTableColumn,
  TableFilterOptions,
  AspectDistanceTypeInterface,
  FilterModalImperativeHandle,
} from "@/interfaces/AspectTableInterfaces";
import {
  AspectedElement,
  AspectType,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import AspectFilterModal from "../modals/AspectFilterModal";
import DistanceTypeFilterModal from "../modals/DistanceTypeFilterModal";
import DistanceFilterModal from "../modals/DistanceFilterModal";
import ElementFilterModal from "../modals/ElementFilterModal";

export type AspectFilterButtonImperativeHandle = {
  clearFilter: () => void;
};

interface TableFilterProps {
  type: AspectTableColumn;
  elements?: AspectedElement[];
  distanceValues?: AspectDistance[];
  distanceTypes?: AspectDistanceTypeInterface[];
  modalIndex: number;
  openModal: boolean;
  disableFilterBtn: boolean;
  onModalButtonClick?: (index: number) => void;
  onCancel?: (options?: TableFilterOptions) => void;
  onConfirm?: (options?: TableFilterOptions) => void;
  getElementImage?: (element: AspectedElement) => React.ReactNode;
}

function AspectTableFilterButtonFn(
  props: TableFilterProps,
  ref: React.ForwardedRef<AspectFilterButtonImperativeHandle>
) {
  const {
    type,
    elements,
    distanceValues,
    distanceTypes,
    modalIndex,
    openModal,
    disableFilterBtn,
    onModalButtonClick,
    onCancel,
    onConfirm,
    getElementImage,
  } = props;

  const elementModalRef = useRef<FilterModalImperativeHandle | null>(null);
  const aspectModalRef = useRef<FilterModalImperativeHandle | null>(null);
  const aspectedElementModalRef = useRef<FilterModalImperativeHandle | null>(
    null
  );
  const distanceModalRef = useRef<FilterModalImperativeHandle | null>(null);
  const distanceTypeModalRef = useRef<FilterModalImperativeHandle | null>(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [memorizedOptions, setMemorizedOptions] = useState<any>(undefined);
  const optionsInitialState = useRef<any>(undefined);
  const [filterIsActive, setFilterIsActive] = useState(false);
  const [shouldClear, setShouldClear] = useState(false);

  useEffect(() => {
    setModalIsOpen(openModal);
  }, [openModal]);

  useEffect(() => {
    if (shouldClear) {
      console.log("2. clearFilter on col button");
      // console.log(elementModalRef.current);

      if (elementModalRef.current) {
        elementModalRef.current.clearFilterModalFields();
      }

      if (aspectModalRef.current) {
        aspectModalRef.current?.clearFilterModalFields();
      }

      if (aspectedElementModalRef.current) {
        aspectedElementModalRef.current?.clearFilterModalFields();
      }

      if (distanceModalRef.current) {
        distanceModalRef.current?.clearFilterModalFields();
      }

      if (distanceTypeModalRef.current) {
        distanceTypeModalRef.current?.clearFilterModalFields();
      }

      setFilterIsActive(false);
      setMemorizedOptions(undefined);

      setShouldClear(false);
    }
  }, [shouldClear]);

  useImperativeHandle(ref, () => ({
    clearFilter() {
      setShouldClear(true);
    },
  }));

  function handleOnCancel(options?: TableFilterOptions) {
    onCancel?.(options);
    onModalButtonClick?.(modalIndex);
  }

  function handleOnConfirm(options?: TableFilterOptions) {
    if (options) {
      optionsInitialState.current = options;
      setMemorizedOptions(options);
    }

    onConfirm?.(options);
    onModalButtonClick?.(modalIndex);
  }

  function handleOnApplyFilterIsActiveClasses(isActive: boolean) {
    setFilterIsActive(isActive);
  }

  const imgClasses = `${disableFilterBtn ? "opacity-40" : ""}`;
  const imgSrc = `${filterIsActive ? "filter-on.png" : "filter.png"}`;

  return (
    <div className="w-full relative">
      <button
        disabled={disableFilterBtn}
        className="w-full disabled:bg-white h-5 flex flex-row text-[0.7rem] pt-px items-center justify-center bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
        onClick={() =>
          /* Toggle Filter Modal On/Off */
          onModalButtonClick?.(modalIndex)
        }
        title="Filtro de Pesquisa"
      >
        <img className={imgClasses} src={imgSrc} width={14} />
      </button>

      {elements && elements?.length > 0 && type === "element" && (
        <ElementFilterModal
          columnType="element"
          isVisible={modalIsOpen}
          className="absolute top-[21px]"
          ref={elementModalRef}
          initialState={optionsInitialState.current}
          memorizedOptions={memorizedOptions}
          onConfirm={handleOnConfirm}
          onCancel={handleOnCancel}
          applyFilterIsActiveClasses={handleOnApplyFilterIsActiveClasses}
          getElementImage={getElementImage}
        />
      )}

      {type === "aspect" && (
        <AspectFilterModal
          isVisible={modalIsOpen}
          className="absolute top-[21px]"
          ref={aspectModalRef}
          initialState={optionsInitialState.current}
          memorizedOptions={memorizedOptions}
          onConfirm={handleOnConfirm}
          onCancel={handleOnCancel}
          applyFilterIsActiveClasses={handleOnApplyFilterIsActiveClasses}
        />
      )}

      {elements && elements?.length > 0 && type === "aspectedElement" && (
        <ElementFilterModal
          columnType="aspectedElement"
          isVisible={modalIsOpen}
          className="absolute top-[21px] left-0"
          ref={aspectedElementModalRef}
          initialState={optionsInitialState.current}
          memorizedOptions={memorizedOptions}
          onConfirm={handleOnConfirm}
          onCancel={handleOnCancel}
          applyFilterIsActiveClasses={handleOnApplyFilterIsActiveClasses}
          getElementImage={getElementImage}
        />
      )}

      {type === "distance" && (
        <DistanceFilterModal
          isVisible={modalIsOpen}
          className="absolute top-[21px] right-0"
          ref={distanceModalRef}
          initialState={optionsInitialState.current}
          memorizedOptions={memorizedOptions}
          onConfirm={handleOnConfirm}
          onCancel={handleOnCancel}
          applyFilterIsActiveClasses={handleOnApplyFilterIsActiveClasses}
        />
      )}

      {type === "aspectDistanceType" && (
        <DistanceTypeFilterModal
          isVisible={modalIsOpen}
          className="absolute top-[21px] right-0"
          ref={distanceTypeModalRef}
          initialState={optionsInitialState.current}
          memorizedOptions={memorizedOptions}
          onConfirm={handleOnConfirm}
          onCancel={handleOnCancel}
          applyFilterIsActiveClasses={handleOnApplyFilterIsActiveClasses}
        />
      )}
    </div>
  );
}

const AspectTableFilterButton = forwardRef<
  AspectFilterButtonImperativeHandle,
  TableFilterProps
>(AspectTableFilterButtonFn);

export default AspectTableFilterButton;
