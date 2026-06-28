import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import React, { useEffect, useRef, useState } from "react";
import LunarDerivedModal from "../modals/LunarDerivedModal";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAspectsData } from "@/contexts/AspectsContext";
import { BsThreeDots } from "react-icons/bs";
import { FaHome } from "react-icons/fa";
import { AstroChartTogglesState } from "@/hooks/useAstroChartToggles";
import { PTOLEMAIC_TERMS, EGYPTIAN_TERMS } from "@/app/utils/termsAndDecans";

interface AstroChartMenuProps {
  toggleCombineWithBirthChart?: boolean;
  toggleCombineWithReturnChart?: boolean;
  /** Navega de volta ao menu principal. Substitui o antigo botão "Menu Principal" no rodapé. */
  onGoHome: () => void;
  /**
   * Estado e togglers vindos de useAstroChartToggles(), levantado para o
   * componente pai (ChartAndData.tsx). Substitui os useState que antes
   * viviam dentro deste componente.
   */
  toggles: AstroChartTogglesState;
}

export default function AstroChartMenu(props: AstroChartMenuProps) {
  const {
    toggleCombineWithBirthChart,
    toggleCombineWithReturnChart,
    onGoHome,
    toggles,
  } = props;

  const {
    showArabicParts,
    showPlanetsAntiscia,
    showArabicPartsAntiscia,
    showDegrees,
    useTerms,
    useDecans,
    showFixedStars,
    currentTerms,
    toggleArabicParts,
    toggleAntiscia,
    toggleDegrees,
    toggleArabicPartsAntiscia,
    togglePtolemaicTerms,
    toggleEgyptianTerms,
    toggleDecans,
    toggleFixedStars,
  } = toggles;

  const [lunarDerivedModal, setLunarDerivedModal] = useState(false);
  const [mobileContextMenuOpen, setMobileContextMenuOpen] = useState(false);
  const [desktopContextMenuOpen, setDesktopContextMenuOpen] = useState(false);

  const mobileContextMenuRef = useRef<HTMLDivElement>(null);
  const desktopContextMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  const {
    isCombinedWithBirthChart,
    updateIsCombinedWithBirthChart,
    isCombinedWithReturnChart,
    updateIsCombinedWithReturnChart,
    updateIsMountingChart,
    chartIsLocked,
    setChartIsLocked
  } = useBirthChart();

  const { chartMenu } = useChartMenu();
  const { hasIsolatedAspect } = useAspectsData();

  // Nota: o reset de showArabicParts/showPlanetsAntiscia/showArabicPartsAntiscia
  // ao trocar de mapa agora é responsabilidade do componente pai
  // (via toggles.resetPerChartToggles(), chamado em ChartAndData.tsx).

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (mobileContextMenuRef.current && !mobileContextMenuRef.current.contains(e.target as Node)) {
        setMobileContextMenuOpen(false);
      }
      if (desktopContextMenuRef.current && !desktopContextMenuRef.current.contains(e.target as Node)) {
        setDesktopContextMenuOpen(false);
      }
    }
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  function handleOnCloseLunarModal() {
    setLunarDerivedModal(false);
  }

  // Termos Ptolemaicos/Egípcios derivam do estado de currentTerms (qual
  // tabela está ativa), em vez de um boolean próprio — assim a fonte de
  // verdade fica só no hook, sem duplicar estado aqui.
  const usePtolemaicsTerms = useTerms && currentTerms === PTOLEMAIC_TERMS;
  const useEgyptianTerms = useTerms && currentTerms === EGYPTIAN_TERMS;

  const checkSrc = "/check.png";
  const checkSize = 13;
  const menuItemIconSize = 16;

  const menuItemClass =
    "w-full flex gap-2 p-2 pl-1 flex-row items-center justify-between active:bg-blue-100 disabled:opacity-50 hover:bg-zinc-100 active:bg-zinc-200";

  const pillBase =
    "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium whitespace-nowrap transition-colors disabled:opacity-50";
  const pillInactive =
    `${pillBase} border-zinc-400 bg-white text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50`;
  const pillActive =
    `${pillBase} border-blue-500 bg-blue-100 text-blue-800`;

  // Largura fixa e uniforme para as pills fixas (Antiscion, Partes Árabes,
  // Antiscion Partes Árabes) — calculada a partir do texto mais longo entre
  // elas (em "ch", aproximando 1 caractere monoespaçado), com folga para o
  // ícone + padding, para que todas fiquem com a mesma largura sem cortar
  // o texto da maior label.

  // Define quais toggles aparecem no menu, em ordem.
  // Centralizar aqui facilita adicionar novos itens sem duplicar JSX entre
  // a barra de pills (desktop) e o menu de contexto (mobile).
  type MenuItem = {
    key: string;
    label: string;
    active: boolean;
    onClick: () => void;
    visible: boolean;
    iconPath?: string;
    /**
     * Itens marcados como pinned ficam sempre visíveis como pill no desktop
     * (fora do menu de contexto). Os demais entram no menu de contexto do
     * desktop, ao lado das pills fixas. No mobile, pinned não importa: TODOS
     * os itens aparecem dentro do menu de contexto, como já era.
     */
    pinned?: boolean;
  };

  const menuItems: MenuItem[] = [
    {
      key: "planetsAntiscia",
      label: t("birthChart.antiscion"),
      active: showPlanetsAntiscia,
      visible: true,
      iconPath: "planets/antiscion/sun.png",
      onClick: toggleAntiscia,
      pinned: true,
    },
    {
      key: "arabicParts",
      label: t("birthChart.arabicPartsMobile"),
      active: showArabicParts,
      visible: true,
      iconPath: "planets/fortune.png",
      onClick: toggleArabicParts,
      pinned: true,
    },
    {
      key: "arabicPartsAntiscia",
      label: t("birthChart.arabicPartsAntiscionMobile"),
      active: showArabicPartsAntiscia,
      visible: true,
      iconPath: "planets/antiscion/necessity.png",
      onClick: toggleArabicPartsAntiscia,
      pinned: true,
    },
    {
      key: "showFixedStars",
      label: t("birthChart.fixedStars"),
      active: showFixedStars,
      visible: true,
      iconPath: "star-1.png",
      onClick: toggleFixedStars,
    },
    {
      key: "termsPtolemaics",
      label: t("birthChart.termsPtolomaics"),
      active: usePtolemaicsTerms,
      visible: true,
      iconPath: "planets/jupiter.png",
      onClick: () => togglePtolemaicTerms(!usePtolemaicsTerms),
    },
    {
      key: "termsEgyptians",
      label: t("birthChart.termsEgyptians"),
      active: useEgyptianTerms,
      visible: true,
      iconPath: "planets/saturn.png",
      onClick: () => toggleEgyptianTerms(!useEgyptianTerms),
    },
    {
      key: "decans",
      label: t("birthChart.decans"),
      active: useDecans,
      visible: true,
      iconPath: "planets/venus.png",
      onClick: toggleDecans,
    },
    {
      key: "showDegreesNoBirth",
      label: t("birthChart.showInfo"),
      active: showDegrees,
      visible: toggleCombineWithBirthChart === false,
      iconPath: "see-more.png",
      onClick: toggleDegrees,
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
      onClick: toggleDegrees,
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

  function renderPill(item: MenuItem, widthClass?: string) {
    if (!item.visible) return null;

    return (
      <button
        key={item.key}
        disabled={hasIsolatedAspect}
        title={item.label}
        className={`${item.active ? pillActive : pillInactive} ${widthClass ?? ""}`}
        onClick={item.onClick}
      >
        {item.iconPath && <Image alt="" src={item.iconPath} width={14} height={14} unoptimized />}
        <span className="">{item.label}</span>
      </button>
    );
  }

  // Versão "ícone apenas" das pills fixas, usada no mobile: mesmo toggle,
  // mesmo estado ativo/inativo, sem o texto do label — só o ícone, para
  // caber numa linha estreita ao lado do botão de três pontos.
  function renderIconOnlyToggle(item: MenuItem) {
    if (!item.visible || !item.iconPath) return null;

    return (
      <button
        key={item.key}
        disabled={hasIsolatedAspect}
        title={item.label}
        className={`p-1.5 rounded-full border disabled:opacity-50 transition-colors ${
          item.active
            ? "border-blue-500 bg-blue-100"
            : "border-zinc-400 bg-white hover:border-zinc-500"
        }`}
        onClick={item.onClick}
      >
        <Image alt={item.label} src={item.iconPath} width={18} height={18} unoptimized />
      </button>
    );
  }

  const pinnedItems = menuItems.filter((item) => item.pinned);
  const restItems = menuItems.filter((item) => !item.pinned);

  // Largura fixa para as pills fixas (Antiscion, Partes Árabes, Antiscion
  // Partes Árabes), comportando o texto completo da maior label + ícone.
  const pinnedPillWidthClass = "w-52";

  return (
    <>
      {/* Desktop: Home + 3 pills fixas, centralizadas, mesma largura + menu de
          contexto ao lado para o restante dos toggles */}
      <div className="hidden md:flex w-full flex-row items-center justify-center gap-1.5">
        <button
          title={t("birthChart.home")}
          className={pillInactive}
          onClick={onGoHome}
        >
          <FaHome size={14} />
          <span>{t("birthChart.home")}</span>
        </button>

        {pinnedItems.map((item) => renderPill(item, pinnedPillWidthClass))}

        <div className="relative" ref={desktopContextMenuRef}>
          <button
            className={`p-1.5 rounded-full border disabled:opacity-50 transition-colors ${
              desktopContextMenuOpen
                ? "border-blue-500 bg-blue-100"
                : "border-zinc-400 bg-white hover:border-zinc-500"
            }`}
            onClick={() => setDesktopContextMenuOpen((prev) => !prev)}
          >
            <BsThreeDots size={18} />
          </button>

          {desktopContextMenuOpen && (
            <div className="absolute w-[18rem] bg-zinc-50 shadow px-2 py-3 right-0 top-9 flex flex-col items-start z-50">
              {restItems.map(renderMenuItem)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: mantém o menu de contexto, exatamente como já era */}
      <div className="md:hidden right-0 w-full flex flex-row items-center justify-between z-50">
        <div className="flex flex-row items-center gap-1.5">
          <button
            title={t("birthChart.home")}
            className="p-1.5 rounded-full border border-zinc-300 bg-white hover:border-zinc-400 transition-colors"
            onClick={onGoHome}
          >
            <FaHome size={22} />
          </button>

          {/* Cadeado: só faz sentido fixar a visualização no mobile, onde o mapa ocupa a tela inteira */}
          <button
            className={`p-1.5 rounded-full border disabled:opacity-50 transition-colors ${
              chartIsLocked
                ? "border-blue-500 bg-blue-100"
                : "border-zinc-400 bg-white hover:border-zinc-500"
            }`}
            onClick={() => setChartIsLocked(!chartIsLocked)}
          >
            <Image alt="lock" src={chartIsLocked ? "lock.png" : "lock-open.png"} width={20} height={20} unoptimized />
          </button>
        </div>

        <div className="flex flex-row items-center gap-1.5">
          {pinnedItems.map(renderIconOnlyToggle)}

          <div className="relative" ref={mobileContextMenuRef}>
            <button
              className={`p-1.5 rounded-full border disabled:opacity-50 transition-colors ${
                mobileContextMenuOpen
                  ? "border-blue-500 bg-blue-100"
                  : "border-zinc-400 bg-white hover:border-zinc-500"
              }`}
              onClick={() => setMobileContextMenuOpen((prev) => !prev)}
            >
              <BsThreeDots size={20} />
            </button>

            {mobileContextMenuOpen && (
              <div className="absolute w-[18rem] bg-zinc-50 shadow px-2 py-3 right-0 top-8 flex flex-col items-start z-50">
                {menuItems.map(renderMenuItem)}
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