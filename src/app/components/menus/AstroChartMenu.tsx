import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import React, { useEffect, useState } from "react";
import LunarDerivedModal from "../modals/LunarDerivedModal";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface AstroChartMenuProps {
  toggleCombineWithBirthChart?: boolean;
  toggleCombineWithReturnChart?: boolean;
  togglePlanetsAntiscia?: () => void;
  toggleArabicParts?: () => void;
  toggleArabicPartsAntiscia?: () => void;
  toggleDegrees?: () => void;
}

export default function AstroChartMenu(props: AstroChartMenuProps) {
  const {
    toggleArabicParts,
    toggleArabicPartsAntiscia,
    toggleCombineWithBirthChart,
    toggleCombineWithReturnChart,
    togglePlanetsAntiscia,
    toggleDegrees
  } = props;

  const [planetsAntiscia, setPlanetsAntiscia] = useState(false);
  const [arabicParts, setArabicParts] = useState(false);
  const [arabicPartsAntiscia, setArabicPartsAntiscia] = useState(false);
  const [showDegrees, setShowDegrees] = useState(true);
  const [lunarDerivedModal, setLunarDerivedModal] = useState(false);
  const t = useTranslations();

  const {
    birthChart,
    returnChart,
    lunarDerivedChart,
    progressionChart,
    profectionChart,
    isCombinedWithBirthChart,
    updateIsCombinedWithBirthChart,
    isCombinedWithReturnChart,
    updateIsCombinedWithReturnChart,
    isMountingChart,
    updateIsMountingChart
  } = useBirthChart();

  const { chartMenu } = useChartMenu();

  useEffect(() => {
    setPlanetsAntiscia(false);
    setArabicParts(false);
    setArabicPartsAntiscia(false);
  }, [birthChart, returnChart, lunarDerivedChart, progressionChart, profectionChart, isMountingChart]);

  function handleOnCloseLunarModal() {
    setLunarDerivedModal(false);
  }

  const checkSrc = "/check.png";
  const checkSize = 13;
  const className =
    "default-btn flex flex-row gap-1 items-center justify-center text-[0.65rem] md:text-[0.75rem] w-full text-white px-0 py-2 rounded";

    const pillBase =
    "flex items-center justify-center text-[0.7rem] md:text-[0.75rem] px-3 py-2 rounded-full border-2 transition-all cursor-pointer whitespace-nowrap";
  const pillActive =
    `${pillBase} default-bg border-blue-700 text-white`;
  const pillInactive =
    `${pillBase} bg-transparent border-zinc-300 dark:border-zinc-600 text-black dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200`;

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex flex-row items-center justify-center gap-1">
          <button
            className={planetsAntiscia ? pillActive : pillInactive}
            onClick={() => {
              setPlanetsAntiscia((prev) => !prev);
              togglePlanetsAntiscia?.();
            }}
          >
            <span className="w-min block md:hidden">{t("birthChart.antiscion")}</span>
            <span className="w-min hidden md:block">{t("birthChart.planetsAntiscion")}</span>
          </button>

          <button
            className={arabicParts ? pillActive : pillInactive}
            onClick={() => {
              setArabicParts((prev) => !prev);
              toggleArabicParts?.();
            }}
          >
            <span className="w-min hidden md:block">{t("birthChart.arabicParts")}</span>
            <span className="w-min block md:hidden">{t("birthChart.arabicPartsMobile")}</span>
          </button>
          
            <button
              className={arabicPartsAntiscia ? pillActive : pillInactive}
              onClick={() => {
                setArabicPartsAntiscia((prev) => !prev);
                toggleArabicPartsAntiscia?.();
              }}
            >
              <span className="w-min hidden md:block">{t("birthChart.arabicPartsAntiscion")}</span>
              <span className="w-min block md:hidden">{t("birthChart.arabicPartsAntiscionMobile")}</span>
            </button>    

          {
            toggleCombineWithBirthChart === false && 
            <button
              className={showDegrees ? pillActive : pillInactive}
              onClick={() => {
                setShowDegrees((prev) => !prev);
                toggleDegrees?.();
              }}
            >
              <span className="w-min hidden md:block">{t("birthChart.showDegrees")}</span>
              <span className="w-min block md:hidden">{t("birthChart.showDegreesMobile")}</span>
            </button>      
          }
        </div>

        <div className="w-full flex flex-row justify-center gap-1">
          {
            toggleCombineWithBirthChart &&
            <button
              className={showDegrees ? pillActive : pillInactive}
              onClick={() => {
                setShowDegrees((prev) => !prev);
                toggleDegrees?.();
              }}
            >
              <span className="w-min hidden md:block">{t("birthChart.showDegrees")}</span>
              <span className="w-min block md:hidden">{t("birthChart.showDegreesMobile")}</span>
            </button>
          }

          {toggleCombineWithBirthChart && !isCombinedWithReturnChart && (
            <button
              className={isCombinedWithBirthChart ? pillActive : pillInactive}
              onClick={() => {
                updateIsCombinedWithBirthChart(!isCombinedWithBirthChart);
                updateIsMountingChart(true);
              }}
            >
              <span className="w-min hidden md:block">{t("returnChart.combineWithBirthChart")}</span>
              <span className="w-min block md:hidden">{t("returnChart.combineWithBirthChartMobile")}</span>
            </button>
          )}

          {toggleCombineWithReturnChart && !isCombinedWithBirthChart && (
            <button
              className={isCombinedWithReturnChart ? pillActive : pillInactive}
              onClick={() => {
                updateIsCombinedWithReturnChart(!isCombinedWithReturnChart);
                updateIsMountingChart(true);
              }}
            >
              <span className="w-min hidden md:block">{t("returnChart.combineWithSolarReturnChart")}</span>
              <span className="w-min block md:hidden">{t("returnChart.combineWithSolarReturnChartMobile")}</span>
            </button>
          )}

          {chartMenu === "solarReturn" && (
            <button
              className={lunarDerivedModal ? pillActive : pillInactive}
              onClick={() => {
                setLunarDerivedModal(true);
              }}
            >
              {/* {t("returnChart.lunarDerivedReturn")} */}
              <span className="w-min hidden md:block">{t("returnChart.lunarDerivedReturn")}</span>
              <span className="w-min block md:hidden">{t("returnChart.lunarDerivedReturnMobile")}</span>
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
