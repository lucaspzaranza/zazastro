import React, { createContext, useState, useContext, ReactNode } from "react";

export type ChartMenuType =
  | "birth"
  | "solarReturn"
  | "lunarReturn"
  | "lunarDerivedReturn"
  | "sinastry";

interface ChartMenuContextType {
  chartMenu: ChartMenuType;
  allChartMenus: ChartMenuType[];
  nextChartMenu: () => void;
  previousChartMenu: () => void;
  updateChartMenuDirectly: (chart: ChartMenuType) => void;
  isFirstChart: () => boolean;
  isLastChart: () => boolean;
  addChartMenu: (menuType: ChartMenuType) => void;
  removeChartMenu: (menuType: ChartMenuType) => void;
  resetChartMenus: () => void;
}

const ChartMenuContext = createContext<ChartMenuContextType | undefined>(
  undefined
);

export const ChartMenuContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [menus, setChartMenus] = useState<ChartMenuType[]>(["birth"]);
  const [chartMenu, setChartMenu] = useState<ChartMenuType>("birth");

  const updateChartMenuDirectly = (chart: ChartMenuType) => {
    setChartMenu(chart);
  };

  const isFirstChart = () => {
    return menus.indexOf(chartMenu) === 0;
  };

  const isLastChart = () => {
    return menus.indexOf(chartMenu) === menus.length - 1;
  };

  const nextChartMenu = () => {
    const nextIndex = menus.indexOf(chartMenu) + 1;
    const nextIndexMin = Math.min(nextIndex, menus.length - 1);

    setChartMenu(menus[nextIndexMin]);
  };

  const previousChartMenu = () => {
    const prevIndex = menus.indexOf(chartMenu) - 1;
    const prevIndexMax = Math.max(prevIndex, 0);

    setChartMenu(menus[prevIndexMax]);
  };

  const addChartMenu = (menuType: ChartMenuType) => {
    if (!menus.includes(menuType)) {
      const newArray = menus;
      newArray.push(menuType);
      setChartMenus(newArray);
    }
  };

  const removeChartMenu = (menuType: ChartMenuType) => {
    if (menuType.includes(menuType)) {
      setChartMenus(menus.filter((menu) => menu !== menuType));
    }
  };

  const resetChartMenus = () => {
    setChartMenus(["birth"]);
    setChartMenu("birth");
  };

  return (
    <ChartMenuContext.Provider
      value={{
        chartMenu,
        allChartMenus: menus,
        nextChartMenu,
        previousChartMenu,
        updateChartMenuDirectly,
        isFirstChart,
        isLastChart,
        addChartMenu,
        removeChartMenu,
        resetChartMenus,
      }}
    >
      {children}
    </ChartMenuContext.Provider>
  );
};

export const useChartMenu = () => {
  const context = useContext(ChartMenuContext);
  if (!context) {
    throw new Error(
      "useChartMenu must be used within a ChartMenuContextProvider"
    );
  }
  return context;
};
