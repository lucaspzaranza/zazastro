import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import React, { useEffect, useRef, useState } from "react";
import LunarDerivedModal from "../modals/LunarDerivedModal";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAspectsData } from "@/contexts/AspectsContext";
import { BsThreeDots } from "react-icons/bs";

interface AstroChartMenuProps {
  toggleCombineWithBirthChart?: boolean;
  toggleCombineWithReturnChart?: boolean;
  togglePlanetsAntiscia?: () => void;
  toggleArabicParts?: () => void;
  toggleArabicPartsAntiscia?: () => void;
  toggleDegrees?: () => void;
  togglePtolemaicsTerms?: () => void;
  toggleEgyptianTerms?: () => void;
  toggleDecans?: () => void;
}

export default function AstroChartMenu(props: AstroChartMenuProps) {
  const {
    toggleArabicParts,
    toggleArabicPartsAntiscia,
    toggleCombineWithBirthChart,
    toggleCombineWithReturnChart,
    togglePlanetsAntiscia,
    toggleDegrees,
    togglePtolemaicsTerms,
    toggleEgyptianTerms,
    toggleDecans
  } = props;

  const [planetsAntiscia, setPlanetsAntiscia] = useState(false);
  const [arabicParts, setArabicParts] = useState(false);
  const [arabicPartsAntiscia, setArabicPartsAntiscia] = useState(false);
  const [showDegrees, setShowDegrees] = useState(true);
  const [lunarDerivedModal, setLunarDerivedModal] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [usePtolemaicsTerms, setUsePtolemaicsTerms] = useState(true);
  const [useEgyptianTerms, setUseEgyptianTerms] = useState(true);
  const [useDecans, setUseDecans] = useState(true);
  
  const contextMenuRef = useRef<HTMLDivElement>(null);
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
    updateIsMountingChart,
    chartIsLocked,
    setChartIsLocked
  } = useBirthChart();

  const { chartMenu } = useChartMenu();
  const { hasIsolatedAspect } = useAspectsData();

  useEffect(() => {
    setPlanetsAntiscia(false);
    setArabicParts(false);
    setArabicPartsAntiscia(false);
  }, [birthChart, returnChart, lunarDerivedChart, progressionChart, profectionChart, isMountingChart]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuOpen(false);
      }
    }
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  function handleOnCloseLunarModal() {
    setLunarDerivedModal(false);
  }

  const checkSrc = "/check.png";
  const checkSize = 13;
  const className =
    "default-btn flex flex-row gap-1 items-center justify-center text-[0.65rem] md:text-[0.75rem] w-full text-white px-0 py-2 rounded";

  const pillBase =
    "flex items-center justify-center text-[0.7rem] md:text-[0.75rem] px-3 py-2 rounded-full border transition-all cursor-pointer whitespace-nowrap disabled:opacity-50";
  const pillActive =
    `${pillBase} default-bg border-blue-700 text-white`;
  const pillInactive =
    `${pillBase} bg-transparent border-zinc-300 dark:border-zinc-600 text-black dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:border-zinc-300 disabled:hover:text-black`;

  const mobileMenuItemClass =
    "w-full flex gap-2 p-2 pl-1 flex-row items-center justify-between active:bg-blue-100 disabled:opacity-50";

  // Define quais toggles aparecem no menu mobile, em ordem.
  // Centralizar aqui facilita adicionar novos itens sem duplicar JSX.
  type MobileMenuItem = {
    key: string;
    label: string;
    active: boolean;
    onClick: () => void;
    visible: boolean;
  };

  const mobileMenuItems: MobileMenuItem[] = [
    {
      key: "planetsAntiscia",
      label: t("birthChart.antiscion"),
      active: planetsAntiscia,
      visible: true,
      onClick: () => {
        setPlanetsAntiscia((prev) => !prev);
        togglePlanetsAntiscia?.();
      },
    },
    {
      key: "arabicParts",
      label: t("birthChart.arabicPartsMobile"),
      active: arabicParts,
      visible: true,
      onClick: () => {
        setArabicParts((prev) => !prev);
        toggleArabicParts?.();
      },
    },
    {
      key: "arabicPartsAntiscia",
      label: t("birthChart.arabicPartsAntiscionMobile"),
      active: arabicPartsAntiscia,
      visible: true,
      onClick: () => {
        setArabicPartsAntiscia((prev) => !prev);
        toggleArabicPartsAntiscia?.();
      },
    },
    {
      key: "showDegreesNoBirth",
      label: t("birthChart.showInfo"),
      active: showDegrees,
      visible: toggleCombineWithBirthChart === false,
      onClick: () => {
        setShowDegrees((prev) => !prev);
        toggleDegrees?.();
      },
    },
    {
      key: "combineWithBirthChart",
      label: t("returnChart.combineWithBirthChartMobile"),
      active: isCombinedWithBirthChart,
      visible: !!toggleCombineWithBirthChart && !isCombinedWithReturnChart,
      onClick: () => {
        updateIsCombinedWithBirthChart(!isCombinedWithBirthChart);
        updateIsMountingChart(true);
      },
    },
    {
      key: "combineWithReturnChart",
      label: t("returnChart.combineWithSolarReturnChartMobile"),
      active: isCombinedWithReturnChart,
      visible: !!toggleCombineWithReturnChart && !isCombinedWithBirthChart,
      onClick: () => {
        updateIsCombinedWithReturnChart(!isCombinedWithReturnChart);
        updateIsMountingChart(true);
      },
    },
    {
      key: "lunarDerived",
      label: t("returnChart.lunarDerivedReturnMobile"),
      active: lunarDerivedModal,
      visible: chartMenu === "solarReturn",
      onClick: () => {
        setLunarDerivedModal(true);
      },
    },
    {
      key: "showDegreesWithBirth",
      label: t("birthChart.showInfo"),
      active: showDegrees,
      visible: !!toggleCombineWithBirthChart,
      onClick: () => {
        setShowDegrees((prev) => !prev);
        toggleDegrees?.();
      },
    },
  ];

  function renderMobileMenuItem(item: MobileMenuItem) {
    if (!item.visible) return null;

    return (
      <button
        key={item.key}
        disabled={hasIsolatedAspect}
        title={item.label}
        className={mobileMenuItemClass}
        onClick={item.onClick}
      >
        <span className="text-sm font-normal text-left">{item.label}</span>
        {item.active && (
          <Image alt="check" src={checkSrc} width={checkSize} height={checkSize} unoptimized />
        )}
      </button>
    );
  }

  return (
    <>
      <div className="relative w-full flex flex-col gap-2 ">
        {/* Desktop: pills inline, como antes */}
        <div className="w-full hidden md:grid grid-cols-4 items-stretch justify-center gap-1">
          <button
            disabled={hasIsolatedAspect}
            className={planetsAntiscia ? pillActive : pillInactive}
            onClick={() => {
              setPlanetsAntiscia((prev) => !prev);
              togglePlanetsAntiscia?.();
            }}
          >
            <span className="w-min">{t("birthChart.planetsAntiscion")}</span>
          </button>

          <button
            disabled={hasIsolatedAspect}
            className={arabicParts ? pillActive : pillInactive}
            onClick={() => {
              setArabicParts((prev) => !prev);
              toggleArabicParts?.();
            }}
          >
            <span className="w-min">{t("birthChart.arabicParts")}</span>
          </button>

          <button
            disabled={hasIsolatedAspect}
            className={arabicPartsAntiscia ? pillActive : pillInactive}
            onClick={() => {
              setArabicPartsAntiscia((prev) => !prev);
              toggleArabicPartsAntiscia?.();
            }}
          >
            <span className="w-min">{t("birthChart.arabicPartsAntiscion")}</span>
          </button>

          {toggleCombineWithBirthChart === false && (
            <button
              disabled={hasIsolatedAspect}
              className={showDegrees ? pillActive : pillInactive}
              onClick={() => {
                setShowDegrees((prev) => !prev);
                toggleDegrees?.();
              }}
            >
              <span className="w-min">{t("birthChart.showInfo")}</span>
            </button>
          )}

          {toggleCombineWithBirthChart && !isCombinedWithReturnChart && (
            <button
              disabled={hasIsolatedAspect}
              className={isCombinedWithBirthChart ? pillActive : pillInactive}
              onClick={() => {
                updateIsCombinedWithBirthChart(!isCombinedWithBirthChart);
                updateIsMountingChart(true);
              }}
            >
              <span className="w-min">{t("returnChart.combineWithBirthChart")}</span>
            </button>
          )}

          {toggleCombineWithReturnChart && !isCombinedWithBirthChart && (
            <button
              disabled={hasIsolatedAspect}
              className={isCombinedWithReturnChart ? pillActive : pillInactive}
              onClick={() => {
                updateIsCombinedWithReturnChart(!isCombinedWithReturnChart);
                updateIsMountingChart(true);
              }}
            >
              <span className="w-min">{t("returnChart.combineWithSolarReturnChart")}</span>
            </button>
          )}

          {chartMenu === "solarReturn" && (
            <button
              disabled={hasIsolatedAspect}
              className={lunarDerivedModal ? pillActive : pillInactive}
              onClick={() => {
                setLunarDerivedModal(true);
              }}
            >
              <span className="w-min">{t("returnChart.lunarDerivedReturn")}</span>
            </button>
          )}

          {toggleCombineWithBirthChart && (
            <button
              disabled={hasIsolatedAspect}
              className={showDegrees ? pillActive : pillInactive}
              onClick={() => {
                setShowDegrees((prev) => !prev);
                toggleDegrees?.();
              }}
            >
              <span className="w-min">{t("birthChart.showInfo")}</span>
            </button>
          )}

          <button
              disabled={hasIsolatedAspect}
              className={showDegrees ? pillActive : pillInactive}
              onClick={() => {
                setUsePtolemaicsTerms((prev) => !prev);
                togglePtolemaicsTerms?.();
              }}
            >
              <span className="w-min">{t("birthChart.termsPtolomaics")}</span>
            </button>

            <button
              disabled={hasIsolatedAspect}
              className={showDegrees ? pillActive : pillInactive}
              onClick={() => {
                setUseEgyptianTerms((prev) => !prev);
                toggleEgyptianTerms?.();
              }}
            >
              <span className="w-min">{t("birthChart.termsEgyptians")}</span>
            </button>

            <button
              disabled={hasIsolatedAspect}
              className={showDegrees ? pillActive : pillInactive}
              onClick={() => {
                setUseDecans((prev) => !prev);
                toggleDecans?.();
              }}
            >
              <span className="w-min">{t("birthChart.decans")}</span>
            </button>
        </div>

        {/* Mobile: botão de três pontos + dropdown */}
        <div className="absolute w-full flex md:hidden flex-row items-center justify-between">
          <button
            className={`p-1.5 rounded-full hover:bg-zinc-100 active:bg-zinc-200 ${
              chartIsLocked ? "bg-zinc-200" : ""
            }`}
            onClick={() => setChartIsLocked(!chartIsLocked)}
          >
            <Image alt="lock" src={chartIsLocked? "lock.png" : "lock-open.png"} width={20} height={20} unoptimized />
          </button>

          <div className="relative" ref={contextMenuRef}>
            <button
              className="p-1.5 rounded-full hover:bg-zinc-100 active:bg-zinc-200"
              onClick={() => setContextMenuOpen((prev) => !prev)}
            >
              <BsThreeDots size={20} />
            </button>

            {contextMenuOpen && (
              <div className="absolute w-[16rem] bg-white shadow px-2 py-3 right-0 top-8 flex flex-col items-start z-30">
                {mobileMenuItems.map(renderMobileMenuItem)}
              </div>
            )}
          </div>
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