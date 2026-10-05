// src/app/components/menus/HomeMenu.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Container from "../Container";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useProfiles } from "@/contexts/ProfilesContext";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import type { HouseSystem } from "@/types/HouseSystem";

const iconSize = 22;

export default function HomeMenu() {
  const t = useTranslations();
  const { updateHouseSystem } = useBirthChart();
  const { profiles, updateCurrentSelectedProfile } = useProfiles();
  const { isMobileBreakPoint } = useScreenDimensions();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Same reset the old `menu === "home"` effect did
  useEffect(() => {
    updateHouseSystem("placidus" as HouseSystem);
    updateCurrentSelectedProfile(profiles[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      <Container className="w-[90%] sm:w-1/4">
        <h2 className="text-[1rem] sm:text-lg text-center sm:text-start pt-4 px-2 sm:pt-0 sm:mb-4 font-bold">
          {isMobileBreakPoint() ? t("home.subtitleMobile") : t("home.subtitle")}
        </h2>

        <div className="w-full p-4 sm:p-0 flex flex-col gap-3">
          <div className="w-full flex flex-col gap-2">
            <Link href="/chart" className="default-btn">
              {t("home.birthChart")}
              <Image src="/horoscope.png" width={iconSize} height={iconSize} unoptimized alt="chart" />
            </Link>

            <Link href="/solar-return" className="default-btn">
              {t("home.solarReturn")}
              <Image src="/sun.png" width={iconSize - 2} height={iconSize - 2} unoptimized alt="chart" />
            </Link>

            <Link href="/lunar-return" className="default-btn">
              {t("home.lunarReturn")}
              <Image src="/moon.png" width={iconSize - 2} height={iconSize - 2} unoptimized alt="chart" />
            </Link>

            <Link href="/transits" className="default-btn">
              {t("birthChart.transits")}
              <Image src="/planets/transits/mercury.png" width={iconSize} height={iconSize} unoptimized alt="chart" />
            </Link>

            <Link href="/sinastry" className="default-btn">
              {t("home.sinastry")}
              <Image src="/heart.png" width={iconSize} height={iconSize} unoptimized alt="chart" />
            </Link>

            <Link href="/progressions" className="default-btn">
              {t("home.secondaryProgressions")}
              <Image src="/fast-forward.png" width={iconSize} height={iconSize} unoptimized alt="chart" />
            </Link>

            <Link href="/profections" className="default-btn">
              {t("home.profections")}
              <Image src="/profection.png" width={iconSize + 2} height={iconSize + 2} unoptimized alt="chart" />
            </Link>
          </div>

          <Link href="/forecast" className="default-btn">
            {t("forecast.title")}
            <Image src="/calendar-color.png" width={iconSize} height={iconSize} unoptimized alt="chart" />
          </Link>

          <Link href="/moment" className="default-btn">
            {t("home.momentChart")}
            <Image src="/clock.png" width={iconSize} height={iconSize} unoptimized alt="chart" />
          </Link>
        </div>
      </Container>
  );
}