import {
  decimalToDegreesMinutes,
  getAntiscion,
  getDegreeAndSign,
} from "@/app/utils/chartUtils";
import {
  BirthChart,
  BirthChartProfile,
  planetTypes,
  SelectedCity,
} from "@/interfaces/BirthChartInterfaces";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface UpdateBirthChartOptions {
  chartData?: BirthChart;
  profileName?: string;
  isReturnChart: boolean;
}

interface BirthChartContextType {
  birthChart?: BirthChart;
  updateBirthChart: (chartOptions: UpdateBirthChartOptions) => void;
  returnChart?: BirthChart;
  lunarDerivedChart?: BirthChart;
  updateLunarDerivedChart: (lunarDerivedChart?: BirthChart) => void;
  isCombinedWithBirthChart: boolean;
  updateIsCombinedWithBirthChart: (val: boolean) => void;
  isCombinedWithReturnChart: boolean;
  updateIsCombinedWithReturnChart: (val: boolean) => void;
  profileName?: string;
  currentCity?: SelectedCity;
  updateCurrentCity: (val?: SelectedCity) => void;
}

const BirthChartContext = createContext<BirthChartContextType | undefined>(
  undefined
);

const getGlyphOnly = true;

export const BirthChartContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [profileName, setProfileName] = useState("");
  const [birthChart, setBirthChart] = useState<BirthChart>();
  const [returnChart, setReturnChart] = useState<BirthChart>();
  const [lunarDerivedChart, setLunarDerivedChart] = useState<
    BirthChart | undefined
  >();
  const [isCombinedWithBirthChart, setIsCombinedWithBirthChart] =
    useState(false);
  const [isCombinedWithReturnChart, setIsCombinedWithReturnChart] =
    useState(false);

  const [currentCity, setCurrentCity] = useState<SelectedCity | undefined>();

  const updateIsCombinedWithBirthChart = (val: boolean) => {
    setIsCombinedWithBirthChart(val);
  };

  const updateIsCombinedWithReturnChart = (val: boolean) => {
    setIsCombinedWithReturnChart(val);
  };

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

            fixedStars: chartData.fixedStars.map((star) => ({
              ...star,
              elementType: "fixedStar",
              isAntiscion: false,
              isFromOuterChart: false,
              longitudeSign: getDegreeAndSign(
                decimalToDegreesMinutes(star.longitude),
                getGlyphOnly
              ),
            })),
          };

    // console.log(chartObject);

    if (chartOptions.profileName) {
      setProfileName(chartOptions.profileName);
    }
    if (!isReturnChart) setBirthChart(chartObject);
    else setReturnChart(chartObject);
  };

  const updateLunarDerivedChart = (lunarChart?: BirthChart) => {
    setLunarDerivedChart(lunarChart);
  };

  const updateCurrentCity = (newCity?: SelectedCity) => {
    setCurrentCity(newCity);
  };

  return (
    <BirthChartContext.Provider
      value={{
        profileName,
        birthChart,
        updateBirthChart,
        returnChart,
        isCombinedWithBirthChart,
        updateIsCombinedWithBirthChart,
        isCombinedWithReturnChart,
        updateIsCombinedWithReturnChart,
        lunarDerivedChart,
        updateLunarDerivedChart,
        currentCity,
        updateCurrentCity,
      }}
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
