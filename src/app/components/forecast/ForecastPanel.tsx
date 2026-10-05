// src/app/components/forecast/ForecastPanel.tsx
"use client";
import { IoClose } from "react-icons/io5";
import { useTranslations } from "next-intl";
import Container from "@/app/components/Container";
import ForecastExplorer from "./ForecastExplorer";
import type { SelectedCity } from "@/interfaces/BirthChartInterfaces";

interface ForecastPanelProps {
  coordinates: SelectedCity;
  onClose: () => void;
}

export default function ForecastPanel({ coordinates, onClose }: ForecastPanelProps) {
  const t = useTranslations();

  return (
    <div className="w-full md:w-[450px] 2xl:w-[450px] 3xl:w-[500px] flex flex-col gap-4 2xl:mr-[-15px] 3xl:mr-zero">
      <Container className="h-[700px] sm:h-[760px]">
        <div className="w-full h-full flex flex-col gap-2 p-4 sm:p-0">
          <div className="w-full flex flex-row items-center justify-between flex-shrink-0">
            <span className="text-sm font-semibold text-zinc-800">{t("forecast.title")}</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-200 text-zinc-500">
              <IoClose size={18} />
            </button>
          </div>

          <div className="w-full flex-1 min-h-0">
            <ForecastExplorer coordinates={coordinates} />
          </div>
        </div>
      </Container>
    </div>
  );
}