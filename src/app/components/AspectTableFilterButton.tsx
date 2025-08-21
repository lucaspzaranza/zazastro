"use client";

import {
  AspectDistance,
  AspectTableColumn,
  AspectDistanceType,
  TableFilterOptions,
  AspectFilterOptions,
} from "@/interfaces/AspectTableInterfaces";
import { AspectedElement, AspectType } from "@/interfaces/AstroChartInterfaces";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { getAspectImage } from "../utils/chartUtils";
import AspectTableFilterModal from "./AspectTableFilterModalLayout";
import AspectFilterModal, {
  AspectFilterModalImperativeHandle,
} from "./AspectFilterModal";

export type AspectFilterButtonImperativeHandle = {
  clearFilter: () => void;
};

interface TableFilterProps {
  column: AspectTableColumn;
  elements?: AspectedElement[];
  distanceValues?: AspectDistance[];
  distanceTypes?: AspectDistanceType[];
  modalIndex: number;
  openModal: boolean;
  disableFilterBtn: boolean;
  onModalButtonClick?: (index: number) => void;
  onCancel?: (options?: TableFilterOptions) => void;
  onConfirm?: (options?: TableFilterOptions) => void;
}

function AspectTableFilterButtonFn(
  props: TableFilterProps,
  ref: React.ForwardedRef<AspectFilterButtonImperativeHandle>
) {
  const {
    column,
    elements,
    distanceValues,
    distanceTypes,
    modalIndex,
    openModal,
    disableFilterBtn,
    onModalButtonClick,
    onCancel,
    onConfirm,
  } = props;

  const aspectModalRef = useRef<AspectFilterModalImperativeHandle | null>(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [memorizedOptions, setMemorizedOptions] = useState<any>(undefined);
  const optionsInitialState = useRef<any>(undefined);
  const [filterIsActive, setFilterIsActive] = useState(false);

  useEffect(() => {
    setModalIsOpen(openModal);
  }, [openModal]);

  useImperativeHandle(ref, () => ({
    clearFilter() {
      setFilterIsActive(false);

      aspectModalRef.current?.clearFilterModalFields();
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

      {modalIsOpen && column === "element" && (
        <div className="absolute w-[200%] h-[200%] bg-gray-100">
          <span>Filtrar por Elemento</span>
        </div>
      )}

      {column === "aspect" && (
        <AspectFilterModal
          isVisible={modalIsOpen}
          ref={aspectModalRef}
          initialState={optionsInitialState.current}
          memorizedOptions={memorizedOptions}
          onConfirm={handleOnConfirm}
          onCancel={handleOnCancel}
          applyFilterIsActiveClasses={handleOnApplyFilterIsActiveClasses}
        />
      )}

      {modalIsOpen && column === "aspectedElement" && (
        <div className="absolute w-[200%] h-[200%] bg-gray-100">
          <span>Filtrar por Aspectado</span>
        </div>
      )}

      {modalIsOpen && column === "distance" && (
        <div className="absolute w-[200%] h-[200%] bg-gray-100 right-0">
          <span>Filtrar por Distância</span>
        </div>
      )}

      {modalIsOpen && column === "aspectDistanceType" && (
        <div className="absolute w-[200%] h-[200%] bg-gray-100 right-0">
          <span>Filtrar por Tipo de Distância</span>
        </div>
      )}
    </div>
  );
}

const AspectTableFilterButton = forwardRef<
  AspectFilterButtonImperativeHandle,
  TableFilterProps
>(AspectTableFilterButtonFn);

export default AspectTableFilterButton;
