"use client";

import React from "react";
import { ArabicPartsContextProvider } from "@/contexts/ArabicPartsContext";
import { AspectsContextProvider } from "@/contexts/AspectsContext";
import { BirthChartContextProvider } from "@/contexts/BirthChartContext";
import { ChartMenuContextProvider } from "@/contexts/ChartMenuContext";
import { ProfilesContextProvider } from "@/contexts/ProfilesContext";
import { ScreenDimensionsContextProvider } from "@/contexts/ScreenDimensionsContext";
import ArabicPartsSync from "./components/ArabicPartsSync";
import InitialProfileSync from "./components/InitialProfileSync";

export default function Providers({ children }: { children: React.ReactNode }) {

  return (
    <ProfilesContextProvider>
      <ChartMenuContextProvider>
        <BirthChartContextProvider>
          <ArabicPartsContextProvider>
            <AspectsContextProvider>
              <ScreenDimensionsContextProvider>
                <ArabicPartsSync />
                <InitialProfileSync />
                {children}
              </ScreenDimensionsContextProvider>
            </AspectsContextProvider>
          </ArabicPartsContextProvider>
        </BirthChartContextProvider>
      </ChartMenuContextProvider>
    </ProfilesContextProvider>
  );
}