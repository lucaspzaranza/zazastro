"use client";

import {
  AspectDistance,
  AspectTableColumn,
  AspectDistanceType,
} from "@/interfaces/AspectTableInterfaces";
import { AspectedElement, AspectType } from "@/interfaces/AstroChartInterfaces";
import React, { useEffect, useState } from "react";
import { getAspectImage } from "../utils/chartUtils";
import AspectTableFilterModal from "./AspectTableFilterModal";

interface TableFilterProps {
  column: AspectTableColumn;
  elements?: AspectedElement[];
  distanceValues?: AspectDistance[];
  distanceTypes?: AspectDistanceType[];
  onCancel?: () => void;
  onConfirm?: () => void;
}

const aspects: AspectType[] = [
  "sextile",
  "square",
  "trine",
  "opposition",
  "conjunction",
];

export default function AspectTableFilter({
  column,
  elements,
  distanceValues,
  distanceTypes,
  onCancel,
  onConfirm,
}: TableFilterProps) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [aspectsNodes, setAspectsNodes] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (column === "aspect") {
      setAspectsNodes(aspects.map((aspect) => getAspectImage(aspect)));
      console.log(aspects);
    }
  }, []);

  function handleOnCancel() {
    onCancel?.();
    setModalIsOpen(false);
  }

  function handleOnConfirm() {
    onConfirm?.();
    setModalIsOpen(false);
  }

  return (
    <div className="w-full relative">
      <button
        className="w-full cursor-pointer flex flex-row text-[0.7rem] pt-px items-center justify-center bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
        onClick={() => setModalIsOpen((prev) => !prev)}
        title="Filtro de Pesquisa"
      >
        ▼
      </button>

      {modalIsOpen && column === "element" && (
        <div className="absolute w-[200%] h-[200%] bg-gray-100">
          <span>Filtrar por Elemento</span>
        </div>
      )}

      {modalIsOpen && column === "aspect" && (
        <AspectTableFilterModal
          title="Filtrar por Aspecto"
          onCancel={handleOnCancel}
          onConfirm={handleOnConfirm}
        >
          <div className="grid grid-cols-3 gap-2 p-2">
            {aspectsNodes.map((node, index) => (
              <div
                key={index}
                className="flex flex-row items-center justify-start gap-2"
              >
                <input type="checkbox" id={`aspect-${index}`} />{" "}
                <label htmlFor={`aspect-${index}`}>{node}</label>
              </div>
            ))}
          </div>
        </AspectTableFilterModal>
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
