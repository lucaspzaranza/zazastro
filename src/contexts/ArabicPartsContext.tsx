import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface ArabicPartsContextType {
  arabicParts: ArabicPartsType | undefined;
  updateArabicParts: (arabicPartsData?: ArabicPartsType) => void;
  archArabicParts: ArabicPartsType | undefined;
  updateArchArabicParts: (archArabicPartsData?: ArabicPartsType) => void;
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

  return (
    <ArabicPartsContext.Provider
      value={{
        arabicParts,
        updateArabicParts,
        archArabicParts,
        updateArchArabicParts,
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
