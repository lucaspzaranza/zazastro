import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface ArabicPartsContextType {
  arabicParts: ArabicPartsType | undefined;
  updateArabicParts: (arabicPartsData: ArabicPartsType) => void;
  archArabicParts: ArabicPartsType | undefined;
  updateArchArabicParts: (archArabicPartsData: ArabicPartsType) => void;
}

const ArabicPartsContext = createContext<ArabicPartsContextType | undefined>(
  undefined
);

export const ArabicPartsContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [arabicParts, setArabicParts] = useState<ArabicPartsType>();
  const [archArabicParts, setArchArabicParts] = useState<ArabicPartsType>();

  const updateArabicParts = (arabicPartsData: ArabicPartsType) => {
    setArabicParts((previous) => {
      return { ...previous, ...arabicPartsData };
    });
  };

  const updateArchArabicParts = (archArabicPartsData: ArabicPartsType) => {
    setArchArabicParts((previous) => {
      return { ...previous, ...archArabicPartsData };
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
