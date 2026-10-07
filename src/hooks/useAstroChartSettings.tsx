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
}

export const DEFAULT_ASTRO_CHART_SETTINGS: AstroChartSettings = {
  showEssentialFixedStars: true,
  showSecondaryFixedStars: true,
  termsType: "egyptian",
  showFaces: true,
  showDetails: true,
  showTransSaturnians: false,
};

const STORAGE_KEY = "zazastro:astro-chart-settings";

export function useAstroChartSettings() {
  const [settings, setSettings] = useState<AstroChartSettings>(DEFAULT_ASTRO_CHART_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_ASTRO_CHART_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // leitura corrompida ou indisponível — segue nos padrões
    } finally {
      setLoaded(true);
    }
  }, []);

  const updateSettings = (patch: Partial<AstroChartSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // modo privado, cota cheia, etc. — segue só em memória
      }
      return next;
    });
  };

  return { settings, updateSettings, loaded };
}