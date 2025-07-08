import {
  decimalToDegreesMinutes,
  getAntiscion,
  getDegreeAndSign,
} from "@/app/utils/chartUtils";
import { BirthChart, planetTypes } from "@/interfaces/BirthChart";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface UpdateBirthChartOptions {
  chartData?: BirthChart;
  isReturnChart: boolean;
}

interface BirthChartContextType {
  birthChart?: BirthChart;
  updateBirthChart: (chartOptions: UpdateBirthChartOptions) => void;
  returnChart?: BirthChart;
}

const BirthChartContext = createContext<BirthChartContextType | undefined>(
  undefined
);

const getGlyphOnly = true;

export const BirthChartContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [birthChart, setBirthChart] = useState<BirthChart>();
  const [returnChart, setReturnChart] = useState<BirthChart>();

  const updateBirthChart = (chartOptions: UpdateBirthChartOptions) => {
    const { chartData, isReturnChart } = chartOptions;
    const chartObject: BirthChart | undefined =
      chartData === undefined
        ? undefined
        : {
            ...chartData,

            planets: chartData.planets.map((planet) => {
              return {
                ...planet,
                longitude: decimalToDegreesMinutes(planet.longitude),
                antiscion: getAntiscion(planet.longitude),

                longitudeRaw: planet.longitude,
                antiscionRaw: getAntiscion(planet.longitude, true),
                type: planetTypes[planet.id],
              };
            }),

            planetsWithSigns: chartData.planets.map((planet) => {
              return {
                position: getDegreeAndSign(
                  decimalToDegreesMinutes(planet.longitude),
                  getGlyphOnly
                ),
                antiscion: getDegreeAndSign(
                  getAntiscion(planet.longitude),
                  getGlyphOnly
                ),
              };
            }),

            housesData: {
              ...chartData?.housesData,
              housesWithSigns: chartData.housesData?.house.map((houseLong) => {
                return getDegreeAndSign(
                  decimalToDegreesMinutes(houseLong),
                  getGlyphOnly
                );
              }),
            },

            birthDate: chartData.birthDate,
          };

    if (!isReturnChart) setBirthChart(chartObject);
    else setReturnChart(chartObject);
  };

  return (
    <BirthChartContext.Provider
      value={{ birthChart, updateBirthChart, returnChart }}
    >
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
