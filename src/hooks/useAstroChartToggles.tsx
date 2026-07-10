import { useState, useEffect } from "react";
import { Sign, TermOrDecan } from "@/interfaces/BirthChartInterfaces";
import { CHALDEAN_DECANS, EGYPTIAN_TERMS, PTOLEMAIC_TERMS } from "@/app/utils/termsAndDecans";

/**
 * Centraliza todo o estado de toggles de exibição do mapa astral
 * (antiscion, partes árabes, graus, estrelas fixas, termos e decanatos).
 *
 * Antes esse estado vivia dentro do próprio AstroChart.tsx, com o
 * AstroChartMenu apenas disparando callbacks. Esse hook permite que o
 * estado suba para o componente pai (ChartAndData.tsx), que passa os
 * valores para AstroChart via props e para AstroChartMenu via os
 * setters/togglers retornados aqui — mantendo os DOIS componentes
 * sincronizados a partir de uma única fonte de verdade.
 *
 * A lógica de exclusividade mútua entre Termos Ptolemaicos e Egípcios
 * (ativar um desativa o outro) foi preservada exatamente como estava
 * dentro do AstroChart original.
 */
export function useAstroChartToggles() {
  const [showArabicParts, setShowArabicParts] = useState(false);
  const [showPlanetsAntiscia, setShowPlanetsAntiscia] = useState(false);
  const [showArabicPartsAntiscia, setShowArabicPartsAntiscia] = useState(false);
  const [showDegrees, setShowDegrees] = useState(true);
  const [useTerms, setUseTerms] = useState(true);
  const [useDecans, setUseDecans] = useState(true);
  const [showFixedStars, setShowFixedStars] = useState(true);
  const [currentTerms, setCurrentTerms] = useState<Record<Sign, TermOrDecan[]> | undefined>(EGYPTIAN_TERMS);

  // Garante que, se useTerms for ativado por algum outro caminho sem uma
  // tabela definida, cai de volta pros Termos Egípcios por padrão (mesmo
  // comportamento do useEffect original dentro do AstroChart).
  useEffect(() => {
    if (useTerms && currentTerms === undefined) {
      setCurrentTerms(EGYPTIAN_TERMS);
    }
  }, [useTerms]);

  const toggleArabicParts = () => {
    setShowArabicParts((prev) => !prev);
  };

  const toggleAntiscia = () => {
    setShowPlanetsAntiscia((prev) => !prev);
  };

  const toggleDegrees = () => {
    setShowDegrees((prev) => !prev);
  };

  const toggleArabicPartsAntiscia = () => {
    setShowArabicPartsAntiscia((prev) => !prev);
  };

  const togglePtolemaicTerms = (val: boolean) => {
    if (!val && currentTerms === PTOLEMAIC_TERMS) {
      setCurrentTerms(undefined);
      setUseTerms(false);
    } else if (val && currentTerms === EGYPTIAN_TERMS) {
      setCurrentTerms(PTOLEMAIC_TERMS);
      setUseTerms(true);
    } else {
      setUseTerms(val);
      setCurrentTerms(val ? PTOLEMAIC_TERMS : undefined);
    }
  };

  const toggleEgyptianTerms = (val: boolean) => {
    if (!val && currentTerms === EGYPTIAN_TERMS) {
      setCurrentTerms(undefined);
      setUseTerms(false);
    } else if (val && currentTerms === PTOLEMAIC_TERMS) {
      setCurrentTerms(EGYPTIAN_TERMS);
      setUseTerms(true);
    } else {
      setUseTerms(val);
      setCurrentTerms(val ? EGYPTIAN_TERMS : undefined);
    }
  };

  const toggleDecans = () => {
    setUseDecans((prev) => !prev);
  };

  const toggleFixedStars = () => {
    setShowFixedStars((prev) => !prev);
  };

  /**
   * Reseta os toggles "por mapa" (antiscion, partes árabes e suas variantes)
   * quando o mapa exibido muda — mesmo comportamento do useEffect original
   * dentro do AstroChart, que reagia a birthChart/returnChart/etc.
   * O componente pai deve chamar isso no useEffect equivalente, passando as
   * mesmas dependências que disparavam o reset antes.
   */
  const resetPerChartToggles = () => {
    setShowArabicParts(false);
    setShowPlanetsAntiscia(false);
    setShowArabicPartsAntiscia(false);
  };

  return {
    // estado
    showArabicParts,
    showPlanetsAntiscia,
    showArabicPartsAntiscia,
    showDegrees,
    useTerms,
    useDecans,
    showFixedStars,
    currentTerms,

    // togglers (para AstroChartMenu e para passar como props de callback)
    toggleArabicParts,
    toggleAntiscia,
    toggleDegrees,
    toggleArabicPartsAntiscia,
    togglePtolemaicTerms,
    toggleEgyptianTerms,
    toggleDecans,
    toggleFixedStars,

    // utilitário de reset
    resetPerChartToggles,
  };
}

export type AstroChartTogglesState = ReturnType<typeof useAstroChartToggles>;