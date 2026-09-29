// src/app/(charts)/layout.tsx
"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useBirthChart } from "@/contexts/BirthChartContext";
import Spinner from "@/app/components/Spinner";

export default function ChartsLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const { loadingNextChart } = useBirthChart();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  return (
    <div className="w-[98vw] min-h-[50vh] md:mt-2 flex flex-col items-center justify-center gap-2">
      {!isClientReady ? (
        <div className="w-[90%] md:w-1/4 h-[416px] md:h-[428px] flex flex-col items-center justify-center space-y-3">
          <Spinner size="16" />
          <span className="pl-5">{t("home.loading")}</span>
        </div>
      ) : (
        <>
          {loadingNextChart && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-screen md:w-full h-full top-0 md:top-auto md:h-[108%] px-3 md:px-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-all duration-200 ease-in-out opacity-0 animate-[fadeIn_0.2s_forwards]">
                <Spinner size="16" />
                <h2 className="font-bold text-lg pl-10 mt-3">{t("home.loading")}</h2>
              </div>
            </div>
          )}
          <div className={`${loadingNextChart ? "opacity-0" : "opacity-100"} w-full flex items-center justify-center`}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}