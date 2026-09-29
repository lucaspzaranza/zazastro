// src/app/components/menus/BirthChartMenu.tsx
"use client";
import { useRouter } from "next/navigation";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useProfiles } from "@/contexts/ProfilesContext";
import { buildChartUrl, birthDateToQueryFields } from "@/utils/chartUrl";
import type { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";
import BirthChartForm from "../charts/BirthChartForm";
import MenuContainer from "./MenuContainer";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import { useTranslations } from "next-intl";
import { useChartNavigation } from "@/hooks/useChartNavigation";

export default function BirthChartMenu() {
  const router = useRouter();
  const { houseSystem } = useBirthChart();
  const { currentProfile } = useProfiles();
  const { screenDimensions, isMobileBreakPoint } = useScreenDimensions();
  const t = useTranslations();
  const { navigating, navigate } = useChartNavigation();

  const handleSubmit = (submitted: BirthChartProfile | undefined) => {
    const source = submitted?.birthDate ? submitted : currentProfile;
    if (!source?.birthDate) return;

    navigate(buildChartUrl({
      type: "birth",
      profileName: source.name ?? "",
      gender: source.gender ?? "event",
      houseSystem: houseSystem ?? "placidus",
      ...birthDateToQueryFields("birth", source.birthDate),
    }));
  };

  return (
    <MenuContainer titleKey="birthChart.title" mobileTitleKey="birthChart.titleMobile" loading={navigating}>
      <BirthChartForm onSubmit={handleSubmit} />
    </MenuContainer>
  )
}