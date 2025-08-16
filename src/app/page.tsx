"use client";

import { BirthChartContextProvider } from "@/contexts/BirthChartContext";
import { ArabicPartsContextProvider } from "@/contexts/ArabicPartsContext";
import BirthChart from "./components/BirthChart";
import ReturnChart from "./components/ReturnChart";
import { AspectsContextProvider } from "@/contexts/AspectsContext";

export default function Home() {
  return (
    <div className="flex flex-col items-center sm:p-20 font-[family-name:var(--font-geist-mono)]">
      <h1>Zazastro</h1>
      <BirthChartContextProvider>
        <ArabicPartsContextProvider>
          <AspectsContextProvider>
            <BirthChart />
            <ReturnChart />
          </AspectsContextProvider>
        </ArabicPartsContextProvider>
      </BirthChartContextProvider>
    </div>
  );
}
