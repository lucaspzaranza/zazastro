import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import React, { useEffect, useRef, useState } from "react";
import LunarDerivedModal from "../modals/LunarDerivedModal";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAspectsData } from "@/contexts/AspectsContext";
import { BsThreeDots } from "react-icons/bs";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";

interface AstroChartMenuProps {
  toggleCombineWithBirthChart?: boolean;
  toggleCombineWithReturnChart?: boolean;
  togglePlanetsAntiscia?: () => void;
  toggleArabicParts?: () => void;
  toggleArabicPartsAntiscia?: () => void;
  toggleDegrees?: () => void;
  togglePtolemaicsTerms?: (val: boolean) => void;
  toggleEgyptianTerms?: (val: boolean) => void;
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
  const [useEgyptianTerms, setUseEgyptianTerms] = useState(false);
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
  const { isMobileBreakPoint } = useScreenDimensions();

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

  function handleTogglePtolemaicTerms() {
    if(useEgyptianTerms) {
      setUseEgyptianTerms(false);
      setUsePtolemaicsTerms(true);
      togglePtolemaicsTerms?.(true);
    } else if(usePtolemaicsTerms) {
      setUsePtolemaicsTerms(false);
      togglePtolemaicsTerms?.(false);
    } else {
      setUsePtolemaicsTerms(true);
      togglePtolemaicsTerms?.(true);
    }
  }

  function handleToggleEgyptianTerms() {
    if(usePtolemaicsTerms) {
      setUsePtolemaicsTerms(false);
      setUseEgyptianTerms(true);
      toggleEgyptianTerms?.(true);
    } else if(useEgyptianTerms) {
      setUseEgyptianTerms(false);
      toggleEgyptianTerms?.(false);
    } else {
      setUseEgyptianTerms(true);
      toggleEgyptianTerms?.(true);
    }
  }

  const checkSrc = "/check.png";
  const checkSize = 13;
  const menuItemIconSize = 16;

  const menuItemClass =
    "w-full flex gap-2 p-2 pl-1 flex-row items-center justify-between active:bg-blue-100 disabled:opacity-50 hover:bg-zinc-100 active:bg-zinc-200";

  // Define quais toggles aparecem no menu de contexto, em ordem.
  // Centralizar aqui facilita adicionar novos itens sem duplicar JSX entre desktop/mobile.
  type MenuItem = {
    key: string;
    label: string;
    active: boolean;
    onClick: () => void;
    visible: boolean;
    iconPath?: string;
  };

  const menuItems: MenuItem[] = [
    {
      key: "planetsAntiscia",
      label: t("birthChart.antiscion"),
      active: planetsAntiscia,
      visible: true,
      iconPath: "planets/antiscion/sun.png",
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
      iconPath: "planets/fortune.png",
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
      iconPath: "planets/antiscion/necessity.png",
      onClick: () => {
        setArabicPartsAntiscia((prev) => !prev);
        toggleArabicPartsAntiscia?.();
      },
    },
    {
      key: "termsPtolemaics",
      label: t("birthChart.termsPtolomaics"),
      active: usePtolemaicsTerms,
      visible: true,
      iconPath: "planets/jupiter.png",
      onClick: handleTogglePtolemaicTerms,
    },
    {
      key: "termsEgyptians",
      label: t("birthChart.termsEgyptians"),
      active: useEgyptianTerms,
      visible: true,
      iconPath: "planets/saturn.png",
      onClick: handleToggleEgyptianTerms,
    },
    {
      key: "decans",
      label: t("birthChart.decans"),
      active: useDecans,
      visible: true,
      iconPath: "planets/venus.png",
      onClick: () => {
        setUseDecans((prev) => !prev);
        toggleDecans?.();
      },
    },
    {
      key: "showDegreesNoBirth",
      label: t("birthChart.showInfo"),
      active: showDegrees,
      visible: toggleCombineWithBirthChart === false,
      iconPath: "see-more.png",
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
      iconPath: "combine.png",
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
      iconPath: "planets/sun.png",
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
      iconPath: "planets/moon.png",
      onClick: () => {
        setLunarDerivedModal(true);
      },
    },
    {
      key: "showDegreesWithBirth",
      label: t("birthChart.showInfo"),
      active: showDegrees,
      visible: !!toggleCombineWithBirthChart,
      iconPath: "see-more.png",
      onClick: () => {
        setShowDegrees((prev) => !prev);
        toggleDegrees?.();
      },
    },
  ];

  function renderMenuItem(item: MenuItem) {
    if (!item.visible) return null;

    return (
      <button
        key={item.key}
        disabled={hasIsolatedAspect}
        title={item.label}
        className={menuItemClass}
        onClick={item.onClick}
      >
        <div className="flex flex-row items-center justify-center gap-2">
          {item.iconPath && <Image alt="check" src={item.iconPath} width={menuItemIconSize} height={menuItemIconSize} unoptimized />}
          <span className="text-sm font-normal text-left">{item.label}</span>
        </div>
        {item.active && (
          <Image alt="check" src={checkSrc} width={checkSize} height={checkSize} unoptimized />
        )}
      </button>
    );
  }

  return (
    <>
      <div className="absolute right-0 md:right-4 w-full flex flex-row items-center justify-between">
        {/* Cadeado: só faz sentido fixar a visualização no mobile, onde o mapa ocupa a tela inteira */}
        {isMobileBreakPoint() ? (
          <button
            className={`p-1.5 rounded-full hover:bg-zinc-100 active:bg-zinc-200 ${
              chartIsLocked ? "bg-zinc-200" : ""
            }`}
            onClick={() => setChartIsLocked(!chartIsLocked)}
          >
            <Image alt="lock" src={chartIsLocked ? "lock.png" : "lock-open.png"} width={20} height={20} unoptimized />
          </button>
        ) : (
          // Mantém o espaço simétrico no desktop, empurrando o menu de contexto para a direita
          <span className="w-[32px]" />
        )}

        <div className="relative" ref={contextMenuRef}>
          <button
            className="p-1.5 rounded-full hover:bg-zinc-100 active:bg-zinc-200"
            onClick={() => setContextMenuOpen((prev) => !prev)}
          >
            <BsThreeDots size={20} />
          </button>

          {contextMenuOpen && (
            <div className="absolute w-[18rem] bg-zinc-50 shadow px-2 py-3 right-0 top-8 flex flex-col items-start z-30">
              {menuItems.map(renderMenuItem)}
            </div>
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