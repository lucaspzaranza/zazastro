"use client";

import { PlanetAspectData } from "@/interfaces/AstroChartInterfaces";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface AspectsContextType {
  aspects: PlanetAspectData[] | undefined;
  selectedAspect: PlanetAspectData | null;
  setSelectedAspect: (newSelectedAspectData: PlanetAspectData | null) => void;
  updateAspectsData: (newAspectsData: PlanetAspectData[]) => void;
  hasIsolatedAspect: boolean;
  setHasIsolatedAspect: (val: boolean) => void;
}

const AspectsContext = createContext<AspectsContextType | undefined>(undefined);

export const AspectsContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [aspects, setAspects] = useState<PlanetAspectData[]>([]);
  const [selectedAspect, setSelectedAspect] = useState<PlanetAspectData | null>(null);
  const [hasIsolatedAspect, setHasIsolatedAspect] = useState(false);

  const updateAspectsData = (aspects: PlanetAspectData[]) => {
    setAspects(aspects);
  };

  return (
    <AspectsContext.Provider
      value={{
        aspects,
        updateAspectsData,
        selectedAspect,
        setSelectedAspect,
        hasIsolatedAspect,
        setHasIsolatedAspect
      }}
    >
      {children}
    </AspectsContext.Provider>
  );
};

export const useAspectsData = () => {
  const context = useContext(AspectsContext);
  if (!context) {
    throw new Error(
      "useAspectsData must be used within a AspectsContextProvider"
    );
  }
  return context;
};
