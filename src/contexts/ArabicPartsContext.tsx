import { ArabicParts } from "@/interfaces/ArabicPartInterfaces";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface ArabicPartsContextType {
  arabicParts: ArabicParts | undefined;
  updateArabicParts: (arabicPartsData: ArabicParts) => void;
  archArabicParts: ArabicParts | undefined;
  updateArchArabicParts: (archArabicPartsData: ArabicParts) => void;
}

const ArabicPartsContext = createContext<ArabicPartsContextType | undefined>(
  undefined
);

export const ArabicPartsContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [arabicParts, setArabicParts] = useState<ArabicParts>();
  const [archArabicParts, setArchArabicParts] = useState<ArabicParts>();

  const updateArabicParts = (arabicPartsData: ArabicParts) => {
    setArabicParts((previous) => {
      return { ...previous, ...arabicPartsData };
    });
  };

  const updateArchArabicParts = (archArabicPartsData: ArabicParts) => {
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
