import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { PlanetAspectData } from "@/interfaces/AstroChartInterfaces";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface AspectsContextType {
  aspects: PlanetAspectData[] | undefined;
  updateAspectsData: (newAspectsData: PlanetAspectData[]) => void;
}

const AspectsContext = createContext<AspectsContextType | undefined>(undefined);

export const AspectsContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [aspects, setAspects] = useState<PlanetAspectData[]>([]);

  const updateAspectsData = (aspects: PlanetAspectData[]) => {
    setAspects(aspects);
  };

  return (
    <AspectsContext.Provider
      value={{
        aspects,
        updateAspectsData,
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
