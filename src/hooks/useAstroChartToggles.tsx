// src/app/hooks/useAstroChartToggles.tsx
import { useState, useEffect } from "react";
import { Sign, TermOrDecan } from "@/interfaces/BirthChartInterfaces";
import { CHALDEAN_DECANS, EGYPTIAN_TERMS, PTOLEMAIC_TERMS } from "@/app/utils/termsAndDecans";
import { useAstroChartSettings } from "./useAstroChartSettings";

export function useAstroChartToggles() {
  const { settings, loaded } = useAstroChartSettings();

  const [showArabicParts, setShowArabicParts] = useState(false);
  const [showPlanetsAntiscia, setShowPlanetsAntiscia] = useState(false);
  const [showArabicPartsAntiscia, setShowArabicPartsAntiscia] = useState(false);
  const [showDegrees, setShowDegrees] = useState(true);
  const [useTerms, setUseTerms] = useState(true);
  const [useDecans, setUseDecans] = useState(true);
  const [showFixedStars, setShowFixedStars] = useState(true);
  const [currentTerms, setCurrentTerms] = useState<Record<Sign, TermOrDecan[]> | undefined>(EGYPTIAN_TERMS);
  const [initializedFromSettings, setInitializedFromSettings] = useState(false);

  /**
   * Aplica as configurações salvas DE UMA SÓ VEZ, assim que a leitura do
   * localStorage termina (loaded === true). Como `settings` e `loaded` são
   * atualizados dentro do MESMO efeito em useAstroChartSettings, no render
   * em que `loaded` vira true, `settings` já carrega os valores finais —
   * não precisamos de efeitos separados por campo, nem esperar várias
   * rodadas de render. `initializedFromSettings` garante que isso rode
   * exatamente uma vez.
   */
  useEffect(() => {
    if (!loaded || initializedFromSettings) return;

    setShowDegrees(settings.showDetails);
    setUseDecans(settings.showFaces);
    setShowFixedStars(settings.showEssentialFixedStars || settings.showSecondaryFixedStars);
    setUseTerms(settings.termsType !== null);
    setCurrentTerms(
      settings.termsType === "ptolemaic" ? PTOLEMAIC_TERMS
        : settings.termsType === "egyptian" ? EGYPTIAN_TERMS
        : undefined
    );
    setInitializedFromSettings(true);
  }, [loaded, settings, initializedFromSettings]);

  const toggleArabicParts = () => setShowArabicParts((prev) => !prev);
  const toggleAntiscia = () => setShowPlanetsAntiscia((prev) => !prev);
  const toggleDegrees = () => setShowDegrees((prev) => !prev);
  const toggleArabicPartsAntiscia = () => setShowArabicPartsAntiscia((prev) => !prev);

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

  const toggleDecans = () => setUseDecans((prev) => !prev);
  const toggleFixedStars = () => setShowFixedStars((prev) => !prev);

  const resetPerChartToggles = () => {
    setShowArabicParts(false);
    setShowPlanetsAntiscia(false);
    setShowArabicPartsAntiscia(false);
  };

  return {
    showArabicParts,
    showPlanetsAntiscia,
    showArabicPartsAntiscia,
    showDegrees,
    useTerms,
    useDecans,
    showFixedStars,
    currentTerms,
    ready: initializedFromSettings, // <- substitui o canRenderChart com setTimeout

    toggleArabicParts,
    toggleAntiscia,
    toggleDegrees,
    toggleArabicPartsAntiscia,
    togglePtolemaicTerms,
    toggleEgyptianTerms,
    toggleDecans,
    toggleFixedStars,

    resetPerChartToggles,
  };
}

export type AstroChartTogglesState = ReturnType<typeof useAstroChartToggles>;