"use client";

import { BirthChartContextProvider } from "@/contexts/BirthChartContext";
import { ArabicPartsContextProvider } from "@/contexts/ArabicPartsContext";
import BirthChart from "./components/charts/BirthChart";
import ReturnChart from "./components/charts/ReturnChart";
import { AspectsContextProvider } from "@/contexts/AspectsContext";

export default function Home() {
  return (
    <div className="min-h-[100vh] flex flex-col items-center justify-start sm:p-20 font-[family-name:var(--font-geist-mono)]">
      <section className="flex flex-row items-start gap-2">
        <h1 className="text-3xl font-bold">Zazastro</h1>
        <img src="pisces.png" width={30} />
      </section>

      <BirthChartContextProvider>
        <ArabicPartsContextProvider>
          <AspectsContextProvider>
            <BirthChart />
          </AspectsContextProvider>
        </ArabicPartsContextProvider>
      </BirthChartContextProvider>
    </div>
  );
}
