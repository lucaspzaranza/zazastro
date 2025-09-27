"use client";

import { BirthChartContextProvider } from "@/contexts/BirthChartContext";
import { ArabicPartsContextProvider } from "@/contexts/ArabicPartsContext";
import BirthChart from "./components/charts/BirthChart";
import { AspectsContextProvider } from "@/contexts/AspectsContext";
import { ChartMenuContextProvider } from "@/contexts/ChartMenuContext";
import { ProfilesContextProvider } from "@/contexts/ProfilesContext";
import { ScreenDimensionsContextProvider } from "@/contexts/ScreenDimensionsContext";
import Image from "next/image";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen sm:min-h-[100vh] flex flex-col items-center justify-between font-[family-name:var(--font-geist-mono)] bg-gradient-to-b from-blue-50 via-slate-50 to-blue-200">
      <div className=" flex flex-row items-center gap-2 pt-4">
        <h1 className="text-3xl font-bold">Zazastro</h1>
        <Image alt="logo" src="/pisces.png" width={30} height={30} />
      </div>
      <ProfilesContextProvider>
        <ChartMenuContextProvider>
          <BirthChartContextProvider>
            <ArabicPartsContextProvider>
              <AspectsContextProvider>
                <ScreenDimensionsContextProvider>
                  <BirthChart />
                </ScreenDimensionsContextProvider>
              </AspectsContextProvider>
            </ArabicPartsContextProvider>
          </BirthChartContextProvider>
        </ChartMenuContextProvider>
      </ProfilesContextProvider>
      <Footer />
    </div>
  );
}
