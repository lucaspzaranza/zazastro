import React, { useState } from "react";

interface AstroChartMenuProps {
  toggleCombineWithBirthChart?: () => void;
  toggleCombineWithReturnChart?: () => void;
  togglePlanetsAntiscia?: () => void;
  toggleArabicParts?: () => void;
  toggleArabicPartsAntiscia?: () => void;
}

export default function AstroChartMenu(props: AstroChartMenuProps) {
  const {
    toggleArabicParts,
    toggleArabicPartsAntiscia,
    toggleCombineWithBirthChart,
    toggleCombineWithReturnChart,
    togglePlanetsAntiscia,
  } = props;

  const [combineWithBirthChart, setCombineWithBirthChart] = useState(false);
  const [combineWithReturnChart, setCombineWithReturnChart] = useState(false);
  const [planetsAntiscia, setPlanetsAntiscia] = useState(false);
  const [arabicParts, setArabicParts] = useState(false);
  const [arabicPartsAntiscia, setArabicPartsAntiscia] = useState(false);

  const className =
    "text-[0.75rem] font-bold p-1  hover:bg-gray-300 active:bg-gray-400";

  return (
    <div
      className="w-full overflow-hidden grid grid-cols-3
    border-2"
    >
      <button
        className={
          "border-r-2 " + className + (planetsAntiscia ? " bg-gray-400" : "")
        }
        onClick={() => {
          setPlanetsAntiscia((prev) => !prev);
          togglePlanetsAntiscia?.();
        }}
      >
        Antiscion Planetas
      </button>

      <button
        className={
          "border-r-2 " + className + (arabicParts ? " bg-gray-400" : "")
        }
        onClick={() => {
          setArabicParts((prev) => !prev);
          toggleArabicParts?.();
        }}
      >
        Partes Árabes
      </button>

      <button
        className={className + (arabicPartsAntiscia ? " bg-gray-400" : "")}
        onClick={() => {
          setArabicPartsAntiscia((prev) => !prev);
          toggleArabicPartsAntiscia?.();
        }}
      >
        Antiscion Partes Árabes
      </button>

      {toggleCombineWithBirthChart && (
        <button
          className={
            "border-r-2 border-t-2 " +
            className +
            (combineWithBirthChart ? " bg-gray-400" : "")
          }
          onClick={() => {
            setCombineWithBirthChart((prev) => !prev);
            toggleCombineWithBirthChart?.();
          }}
        >
          Combinar com Mapa Natal
        </button>
      )}

      {!toggleCombineWithReturnChart && toggleCombineWithBirthChart && (
        <>
          <div className="border-r-2 border-t-2"></div>
          <div className="border-t-2"></div>
        </>
      )}

      {toggleCombineWithReturnChart && (
        <button
          className={
            "border-r-2 border-t-2" +
            className +
            (combineWithReturnChart ? " bg-gray-400" : "")
          }
          onClick={() => {
            setCombineWithReturnChart((prev) => !prev);
            toggleCombineWithReturnChart?.();
          }}
        >
          Combinar com Retorno Solar
        </button>
      )}
    </div>
  );
}
