"use client";

import { BirthChartContextProvider } from "@/contexts/BirthChartContext";
import { ArabicPartsContextProvider } from "@/contexts/ArabicPartsContext";
import BirthChart from "./components/BirthChart";
import ArabicParts from "./components/ArabicParts";
import ReturnChart from "./components/ReturnChart";
import BirthArchArabicParts from "./components/BirthArchArabicParts";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-items-center sm:p-20 font-[family-name:var(--font-geist-mono)]">
      <h1>Zazastro</h1>
      <BirthChartContextProvider>
        <ArabicPartsContextProvider>
          <BirthChart />
          <ArabicParts />
          <ReturnChart />
          <BirthArchArabicParts />
        </ArabicPartsContextProvider>
      </BirthChartContextProvider>
    </div>
  );
}
