"use client";

import {
  AspectDistance,
  AspectTableColumn,
  AspectDistanceType,
  TableFilterOptions,
  AspectFilterOptions,
} from "@/interfaces/AspectTableInterfaces";
import { AspectedElement, AspectType } from "@/interfaces/AstroChartInterfaces";
import React, { useEffect, useState } from "react";
import { getAspectImage } from "../utils/chartUtils";
import AspectTableFilterModal from "./AspectTableFilterModalLayout";
import AspectFilterModal from "./AspectFilterModal";

interface TableFilterProps {
  column: AspectTableColumn;
  elements?: AspectedElement[];
  distanceValues?: AspectDistance[];
  distanceTypes?: AspectDistanceType[];
  modalIndex: number;
  openModal: boolean;
  disableFilterBtn: boolean;
  onModalButtonClick?: (index: number) => void;
  onCancel?: () => void;
  onConfirm?: (options?: TableFilterOptions) => void;
}

export default function AspectTableFilterButton({
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
}: TableFilterProps) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [aspectsNodes, setAspectsNodes] = useState<React.ReactNode[]>([]);
  const [memorizedOptions, setMemorizedOptions] = useState<any>(undefined);

  useEffect(() => {
    setModalIsOpen(openModal);

    if (modalIsOpen) console.log(memorizedOptions);
  }, [openModal]);

  function handleOnCancel() {
    onCancel?.();
    onModalButtonClick?.(modalIndex);
  }

  function handleOnConfirm(options?: TableFilterOptions) {
    if (options) {
      setMemorizedOptions(options);
    }

    onConfirm?.(options);
    onModalButtonClick?.(modalIndex);
  }

  const imgClasses = `${disableFilterBtn ? "opacity-40" : ""}`;

  return (
    <div className="w-full relative">
      <button
        disabled={disableFilterBtn}
        className="w-full disabled:bg-white h-5 flex flex-row text-[0.7rem] pt-px items-center justify-center bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
        onClick={() =>
          /* Toggle Filter On/Off */
          onModalButtonClick?.(modalIndex)
        }
        title="Filtro de Pesquisa"
      >
        {/* ▼ */}
        <img className={imgClasses} src={"filter.png"} width={12} />
      </button>

      {modalIsOpen && column === "element" && (
        <div className="absolute w-[200%] h-[200%] bg-gray-100">
          <span>Filtrar por Elemento</span>
        </div>
      )}

      {modalIsOpen && column === "aspect" && (
        <AspectFilterModal
          memorizedOptions={memorizedOptions}
          onConfirm={handleOnConfirm}
          onCancel={handleOnCancel}
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
