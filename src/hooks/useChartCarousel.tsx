// src/app/hooks/useChartCarousel.ts
"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useBirthChart } from "@/contexts/BirthChartContext";

export function useChartCarousel(stepCount: number) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { updateIsCombinedWithBirthChart, updateIsCombinedWithReturnChart } = useBirthChart();

  const resetCombine = () => {
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);
  };

  const onPrevious = () => {
    resetCombine();
    if (step >= stepCount - 1) {
      router.push(pathname); // já no natal -> sai pro menu da própria rota, sem query string
      return;
    }
    setStep((s) => s + 1);
  };

  const onNext = () => {
    resetCombine();
    setStep((s) => Math.max(0, s - 1));
  };

  return { step, onPrevious, onNext, previousDisabled: false, nextDisabled: step === 0 };
}