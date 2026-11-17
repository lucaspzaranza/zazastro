// src/app/hooks/useAstroChartSettings.ts
"use client";
import { useEffect, useState } from "react";

export interface AstroChartSettings {
  showEssentialFixedStars: boolean;
  showSecondaryFixedStars: boolean;
  termsType: "egyptian" | "ptolemaic" | null;
  showFaces: boolean;
  showDetails: boolean;
  showTransSaturnians: boolean;
  horaryMode: boolean;
}

export const DEFAULT_ASTRO_CHART_SETTINGS: AstroChartSettings = {
  showEssentialFixedStars: true,
  showSecondaryFixedStars: true,
  termsType: "egyptian",
  showFaces: true,
  showDetails: true,
  showTransSaturnians: true,
  horaryMode: false,
};

const STORAGE_KEY = "zazastro:astro-chart-settings";
const SETTINGS_CHANGE_EVENT = "zazastro:astro-chart-settings-change";

export function useAstroChartSettings() {
  const [settings, setSettings] = useState<AstroChartSettings>(DEFAULT_ASTRO_CHART_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handleSettingsChange = (event: Event) => {
      const detail = (event as CustomEvent<AstroChartSettings>).detail;
      if (detail) setSettings(detail);
    };
    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_ASTRO_CHART_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // leitura corrompida ou indisponível — segue nos padrões
    } finally {
      setLoaded(true);
    }
    return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
  }, []);

  const updateSettings = (patch: Partial<AstroChartSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // modo privado, cota cheia, etc. — segue só em memória
    }
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: next }));
  };

  return { settings, updateSettings, loaded };
}
