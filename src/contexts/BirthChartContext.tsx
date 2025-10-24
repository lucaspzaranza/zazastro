import {
  decimalToDegreesMinutes,
  getAntiscion,
  getDegreeAndSign,
} from "@/app/utils/chartUtils";
import {
  BirthChart,
  ChartType,
  planetTypes,
  SelectedCity,
} from "@/interfaces/BirthChartInterfaces";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface UpdateBirthChartOptions {
  chartData?: BirthChart;
  profileName?: string;
  chartType: ChartType;
}

interface BirthChartContextType {
  birthChart?: BirthChart;
  updateBirthChart: (chartOptions: UpdateBirthChartOptions) => void;
  returnChart?: BirthChart;

  lunarDerivedChart?: BirthChart;
  updateLunarDerivedChart: (lunarDerivedChart?: BirthChart) => void;

  progressionChart?: BirthChart;
  profectionChart?: BirthChart;

  isCombinedWithBirthChart: boolean;
  updateIsCombinedWithBirthChart: (val: boolean) => void;
  isCombinedWithReturnChart: boolean;
  updateIsCombinedWithReturnChart: (val: boolean) => void;
  profileName?: string;
  currentCity?: SelectedCity;
  updateCurrentCity: (val?: SelectedCity) => void;

  sinastryChart?: BirthChart;
  updateSinastryChart: (sinastryChart?: BirthChart) => void;

  loadingNextChart: boolean;
  updateLoadingNextChart: (val: boolean) => void;

  isMountingChart: boolean;
  updateIsMountingChart: (val: boolean) => void;
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
  const [progressionChart, setProgressionChart] = useState<BirthChart>();
  const [lunarDerivedChart, setLunarDerivedChart] = useState<
    BirthChart | undefined
  >();
  const [sinastryChart, setSinastryChart] = useState<BirthChart | undefined>();
  const [profectionChart, setProfectionChart] = useState<BirthChart | undefined>();
  const [isCombinedWithBirthChart, setIsCombinedWithBirthChart] =
    useState(false);
  const [isCombinedWithReturnChart, setIsCombinedWithReturnChart] =
    useState(false);

  const [currentCity, setCurrentCity] = useState<SelectedCity | undefined>();
  const [loadingNextChart, setLoadingNextChart] = useState(false);
  const [isMountingChart, setIsMountingChart] = useState(false);

  const updateIsCombinedWithBirthChart = (val: boolean) => {
    setIsCombinedWithBirthChart(val);
  };

  const updateIsCombinedWithReturnChart = (val: boolean) => {
    setIsCombinedWithReturnChart(val);
  };

  const updateBirthChart = (chartOptions: UpdateBirthChartOptions) => {
    const { chartData, chartType } = chartOptions;
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

    if (chartOptions.profileName && chartType !== "sinastry") {
      setProfileName(chartOptions.profileName);
    }

    if (chartType === "birth") setBirthChart(chartObject);
    else if (chartType === "return") setReturnChart(chartObject);
    else if (chartType === "sinastry") setSinastryChart(chartObject);
    else if (chartType === "progression") setProgressionChart(chartObject);
    else if (chartType === "profection") setProfectionChart(chartObject);
  };

  const updateLunarDerivedChart = (lunarChart?: BirthChart) => {
    setLunarDerivedChart(lunarChart);
  };

  const updateSinastryChart = (sinastryChart?: BirthChart) => {
    setSinastryChart(sinastryChart);
  };

  const updateCurrentCity = (newCity?: SelectedCity) => {
    setCurrentCity(newCity);
  };

  const updateLoadingNextChart = (val: boolean) => {
    setLoadingNextChart(val);
  }

  const updateIsMountingChart = (val: boolean) => {
    setIsMountingChart(val);
  }

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
        sinastryChart,
        updateSinastryChart,
        progressionChart,
        loadingNextChart,
        updateLoadingNextChart,
        isMountingChart,
        updateIsMountingChart,
        profectionChart,
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
