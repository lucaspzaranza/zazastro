import {
  decimalToDegreesMinutes,
  getAntiscion,
  getDegreeAndSign,
} from "@/app/utils/chartUtils";
import { BirthChart } from "@/interfaces/BirthChart";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface BirthChartContextType {
  birthChart: BirthChart;
  updateBirthChart: (chartData: BirthChart) => void;
}

const BirthChartContext = createContext<BirthChartContextType | undefined>(
  undefined
);

export const BirthChartContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [birthChart, setBirthChart] = useState<BirthChart>({
    planets: [],
    planetsWithSigns: [],
    housesData: {
      armc: 0,
      ascendant: 0,
      equatorialAscendant: 0,
      house: [],
      housesWithSigns: [],
      kochCoAscendant: 0,
      mc: 0,
      munkaseyCoAscendant: 0,
      munkaseyPolarAscendant: 0,
      vertex: 0,
    },
  });

  const updateBirthChart = (chartData: BirthChart) => {
    setBirthChart({
      ...chartData,

      planets: chartData.planets.map((planet) => {
        return {
          ...planet,
          longitude: decimalToDegreesMinutes(planet.longitude),
          antiscion: getAntiscion(planet.longitude),

          longitudeRaw: planet.longitude,
          antiscionRaw: getAntiscion(planet.longitude, true),
        };
      }),

      planetsWithSigns: chartData.planets.map((planet) => {
        return {
          position: getDegreeAndSign(decimalToDegreesMinutes(planet.longitude)),
          antiscion: getDegreeAndSign(getAntiscion(planet.longitude)),
        };
      }),

      housesData: {
        ...chartData.housesData,
        housesWithSigns: chartData.housesData.house.map((houseLong) => {
          return getDegreeAndSign(decimalToDegreesMinutes(houseLong));
        }),
      },
    });
  };

  return (
    <BirthChartContext.Provider value={{ birthChart, updateBirthChart }}>
      {children}
    </BirthChartContext.Provider>
  );
};

export const useBirthChart = () => {
  const context = useContext(BirthChartContext);
  if (!context) {
    throw new Error(
      "useBirthChart must be used within a BirthChartContextProvider"
    );
  }
  return context;
};
