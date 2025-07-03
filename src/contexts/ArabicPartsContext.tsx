import { ArabicParts } from "@/interfaces/ArabicPart";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface ArabicPartsContextType {
  arabicParts: ArabicParts | undefined;
  updateArabicParts: (arabicPartsData: ArabicParts) => void;
}

const ArabicPartsContext = createContext<ArabicPartsContextType | undefined>(
  undefined
);

export const ArabicPartsContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [arabicParts, setArabicParts] = useState<ArabicParts>();

  const updateArabicParts = (arabicPartsData: ArabicParts) => {
    setArabicParts((previous) => {
      return { ...previous, ...arabicPartsData };
    });
  };

  return (
    <ArabicPartsContext.Provider value={{ arabicParts, updateArabicParts }}>
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
