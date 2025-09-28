import {
  calculateBirthArchArabicPart,
  calculateLotOfCaptivity,
  calculateLotOfChildren,
  calculateLotOfFortune,
  calculateLotOfLove,
  calculateLotOfMarriage,
  calculateLotOfNecessity,
  calculateLotOfResignation,
  calculateLotOfSpirit,
  calculateLotOfValor,
  calculateLotOfVictory,
} from "@/app/utils/arabicPartsUtils";
import { arabicPartKeys } from "@/app/utils/chartUtils";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { ArabicPartType, BirthChart } from "@/interfaces/BirthChartInterfaces";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface ArchArabicPartsOptions {
  isLunarDerivedChart: boolean;
}

interface ArabicPartsContextType {
  arabicParts?: ArabicPartsType;
  updateArabicParts: (arabicPartsData?: ArabicPartsType) => void;
  archArabicParts?: ArabicPartsType;
  updateArchArabicParts: (archArabicPartsData?: ArabicPartsType) => void;

  lunarDerivedParts?: ArabicPartsType;
  updateLunarDerivedParts: (lunarDerivedPartsData?: ArabicPartsType) => void;

  calculateArabicParts: (
    birthChart: BirthChart,
    partType: ArabicPartType
  ) => void;
  calculateBirthArchArabicParts: (
    ascendant: number,
    options?: ArchArabicPartsOptions
  ) => void;
  getPartsArray: (parts: ArabicPartsType) => ArabicPart[];

  /**
   * Used only at lunar derived chart combined with solar return chart case.
   * Use archArabicParts for other cases.
   */
  solarReturnParts?: ArabicPartsType;
  updateSolarReturnParts: (archArabicPartsData?: ArabicPartsType) => void;

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
  const [lunarDerivedParts, setLunarDerivedParts] = useState<
    ArabicPartsType | undefined
  >();
  const [solarReturnParts, setSolarReturnParts] = useState<
    ArabicPartsType | undefined
  >();

  const [sinastryParts, setSinastryParts] = useState<
    ArabicPartsType | undefined
  >();

  function calculateArabicParts(
    birthChart: BirthChart,
    partType: ArabicPartType
  ) {
    const fortune = calculateLotOfFortune(birthChart);
    const spirit = calculateLotOfSpirit(birthChart);

    let parts: ArabicPartsType = {
      fortune,
      spirit,
    };

    parts = {
      ...parts,
      necessity: calculateLotOfNecessity(birthChart, parts),
      love: calculateLotOfLove(birthChart, parts),
      valor: calculateLotOfValor(birthChart, parts),
      victory: calculateLotOfVictory(birthChart, parts),
      captivity: calculateLotOfCaptivity(birthChart, parts),
      marriage: calculateLotOfMarriage(birthChart),
      resignation: calculateLotOfResignation(birthChart),
      children: calculateLotOfChildren(birthChart),
    };

    if (partType === "birth") {
      setArabicParts(parts);
    } else if (partType === "solarReturn") {
      setSolarReturnParts(parts);
    } else if (partType === "sinastry") {
      setSinastryParts(parts);
    }
  }

  function calculateBirthArchArabicParts(
    ascendant: number,
    options?: ArchArabicPartsOptions
  ) {
    if (!arabicParts) return;
    const archLotsObj: ArabicPartsType = {};

    arabicPartKeys.forEach((key) => {
      const part = arabicParts[key];
      if (part) {
        const newArchArabicPart = calculateBirthArchArabicPart(part, ascendant);
        archLotsObj[key] = { ...newArchArabicPart };
      }
    });

    if (options?.isLunarDerivedChart) {
      setLunarDerivedParts(archLotsObj);
    } else setArchArabicParts(archLotsObj);
  }

  function getPartsArray(parts: ArabicPartsType): ArabicPart[] {
    const partsArray: ArabicPart[] = [];

    Object.entries(parts).forEach(([, value]) => {
      if (value) {
        const lot = value as ArabicPart;
        partsArray.push(lot);
      }
    });

    return partsArray;
  }

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

  const updateLunarDerivedParts = (lunarDerivedPartsData?: ArabicPartsType) => {
    setLunarDerivedParts((previous) => {
      return lunarDerivedPartsData
        ? { ...previous, ...lunarDerivedPartsData }
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
        calculateArabicParts,
        calculateBirthArchArabicParts,
        getPartsArray,
        lunarDerivedParts,
        updateLunarDerivedParts,
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
