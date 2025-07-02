"use client";

import { BirthChartContextProvider } from "@/contexts/BirthChartContext";
import BirthChart from "./components/BirthChart";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen sm:p-20 font-[family-name:var(--font-geist-mono)]">
      <h1>Zazastro</h1>
      <BirthChartContextProvider>
        <BirthChart />
      </BirthChartContextProvider>
    </div>
  );
}
