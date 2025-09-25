import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface ArabicPartsContextType {
  arabicParts: ArabicPartsType | undefined;
  updateArabicParts: (arabicPartsData?: ArabicPartsType) => void;
  archArabicParts: ArabicPartsType | undefined;
  updateArchArabicParts: (archArabicPartsData?: ArabicPartsType) => void;

  /**
   * Used only at lunar derived chart combined with solar return chart case.
   * Use archArabicParts for other cases.
   */
  solarReturnParts?: ArabicPartsType;
  updateSolarReturnParts?: (archArabicPartsData?: ArabicPartsType) => void;

  sinastryParts?: ArabicPartsType;
  updateSinastryArabicParts: (sinastryArabicParts?: ArabicPartsType) => void;
}

const ArabicPartsContext = createContext<ArabicPartsContextType | undefined>(
  undefined
);

export const ArabicPartsContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [arabicParts, setArabicParts] = useState<ArabicPartsType | undefined>();
  const [archArabicParts, setArchArabicParts] = useState<
    ArabicPartsType | undefined
  >();
  const [solarReturnParts, setSolarReturnParts] = useState<
    ArabicPartsType | undefined
  >();

  const [sinastryParts, setSinastryParts] = useState<
    ArabicPartsType | undefined
  >();

  const updateArabicParts = (arabicPartsData?: ArabicPartsType) => {
    setArabicParts((previous) => {
      return arabicPartsData ? { ...previous, ...arabicPartsData } : undefined;
    });
  };

  const updateArchArabicParts = (archArabicPartsData?: ArabicPartsType) => {
    setArchArabicParts((previous) => {
      return archArabicPartsData
        ? { ...previous, ...archArabicPartsData }
        : undefined;
    });
  };

  const updateSolarReturnParts = (arabicPartsData?: ArabicPartsType) => {
    setSolarReturnParts((previous) => {
      return arabicPartsData ? { ...previous, ...arabicPartsData } : undefined;
    });
  };

  const updateSinastryArabicParts = (arabicPartsData?: ArabicPartsType) => {
    setSinastryParts((previous) => {
      return arabicPartsData ? { ...previous, ...arabicPartsData } : undefined;
    });
  };

  return (
    <ArabicPartsContext.Provider
      value={{
        arabicParts,
        updateArabicParts,
        archArabicParts,
        updateArchArabicParts,
        solarReturnParts,
        updateSolarReturnParts,
        sinastryParts,
        updateSinastryArabicParts,
      }}
    >
      {children}
    </ArabicPartsContext.Provider>
  );
};

export const useArabicParts = () => {
  const context = useContext(ArabicPartsContext);
  if (!context) {
    throw new Error(
      "useArabicParts must be used within a ArabicPartsContextProvider"
    );
  }
  return context;
};
