import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import React, { useState } from "react";
import LunarDerivedModal from "../modals/LunarDerivedModal";

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

  const [planetsAntiscia, setPlanetsAntiscia] = useState(false);
  const [arabicParts, setArabicParts] = useState(false);
  const [arabicPartsAntiscia, setArabicPartsAntiscia] = useState(false);
  const [lunarDerivedModal, setLunarDerivedModal] = useState(false);

  const {
    isCombinedWithBirthChart,
    updateIsCombinedWithBirthChart,
    isCombinedWithReturnChart,
    updateIsCombinedWithReturnChart,
  } = useBirthChart();

  const { chartMenu } = useChartMenu();

  function handleOnCloseLunarModal() {
    setLunarDerivedModal(false);
  }

  const checkSrc = "check.png";
  const checkSize = 13;
  const className =
    "bg-blue-800 flex flex-row gap-1 items-center justify-center text-[0.65rem] md:text-[0.75rem] w-full text-white px-0 py-2 rounded hover:bg-blue-900";

  return (
    <>
      <div className="w-full flex flex-col gap-1">
        <div className="w-full flex flex-row gap-1">
          <button
            className={className}
            onClick={() => {
              setPlanetsAntiscia((prev) => !prev);
              togglePlanetsAntiscia?.();
            }}
          >
            <span className="w-min">Antiscion Planetas</span>
            {planetsAntiscia && <img src={checkSrc} width={checkSize} />}
          </button>

          <button
            className={className}
            onClick={() => {
              setArabicParts((prev) => !prev);
              toggleArabicParts?.();
            }}
          >
            <span className="w-min">Partes Árabes</span>
            {arabicParts && <img src={checkSrc} width={checkSize} />}
          </button>

          <button
            className={className}
            onClick={() => {
              setArabicPartsAntiscia((prev) => !prev);
              toggleArabicPartsAntiscia?.();
            }}
          >
            <span className="w-min">Antiscion Partes Árabes</span>
            {arabicPartsAntiscia && <img src={checkSrc} width={checkSize} />}
          </button>
        </div>

        <div className="w-full flex flex-row justify-center gap-1">
          {toggleCombineWithBirthChart && (
            <button
              className={className}
              onClick={() => {
                updateIsCombinedWithBirthChart(!isCombinedWithBirthChart);
                toggleCombineWithBirthChart?.();
              }}
            >
              Combinar com Mapa Natal
              {isCombinedWithBirthChart && (
                <img src={checkSrc} width={checkSize} />
              )}
            </button>
          )}

          {toggleCombineWithReturnChart && (
            <button
              className={className}
              onClick={() => {
                updateIsCombinedWithReturnChart(!isCombinedWithReturnChart);
                toggleCombineWithReturnChart?.();
              }}
            >
              Combinar com Retorno Solar
              {isCombinedWithReturnChart && (
                <img src={checkSrc} width={checkSize} />
              )}
            </button>
          )}

          {chartMenu === "solarReturn" && (
            <button
              className={className}
              onClick={() => {
                setLunarDerivedModal(true);
              }}
            >
              Retorno Lunar Derivado
            </button>
          )}
        </div>
      </div>

      {lunarDerivedModal && (
        <div className="flex flex-row justify-center">
          <div className="fixed w-full h-full right-0 top-0 bg-gray-600 opacity-50 z-10" />
          <LunarDerivedModal onClose={handleOnCloseLunarModal} />
        </div>
      )}
    </>
  );
}
