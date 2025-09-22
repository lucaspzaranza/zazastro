"use client";

import { BirthChartContextProvider } from "@/contexts/BirthChartContext";
import { ArabicPartsContextProvider } from "@/contexts/ArabicPartsContext";
import BirthChart from "./components/charts/BirthChart";
import { AspectsContextProvider } from "@/contexts/AspectsContext";
import { ChartMenuContextProvider } from "@/contexts/ChartMenuContext";
import { ProfilesContextProvider } from "@/contexts/ProfilesContext";

export default function Home() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-between font-[family-name:var(--font-geist-mono)]">
      <div className=" flex flex-row items-center gap-2 pt-4">
        <h1 className="text-3xl font-bold">Zazastro</h1>
        <img src="pisces.png" width={30} />
      </div>

      <ProfilesContextProvider>
        <ChartMenuContextProvider>
          <BirthChartContextProvider>
            <ArabicPartsContextProvider>
              <AspectsContextProvider>
                <BirthChart />
              </AspectsContextProvider>
            </ArabicPartsContextProvider>
          </BirthChartContextProvider>
        </ChartMenuContextProvider>
      </ProfilesContextProvider>
    </div>
  );
}
