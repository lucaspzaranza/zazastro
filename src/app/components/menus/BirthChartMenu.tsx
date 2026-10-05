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

interface BirthChartMenuProps {
  editProfileId?: string;
}

export default function BirthChartMenu({ editProfileId }: BirthChartMenuProps) {
  const router = useRouter();
  const { houseSystem } = useBirthChart();
  const { currentProfile, profiles } = useProfiles();
  const { screenDimensions, isMobileBreakPoint } = useScreenDimensions();
  const t = useTranslations();
  const { navigating, navigate } = useChartNavigation();

  const editProfile = editProfileId ? profiles.find((p) => p.id === editProfileId) : undefined;

  const handleSubmit = (submitted: BirthChartProfile | undefined) => {
    const source = submitted?.birthDate ? submitted : currentProfile;
    if (!source?.birthDate) return;

    navigate(buildChartUrl({
      type: "birth",
      profileName: source.name ?? "",
      gender: source.gender ?? "event",
      houseSystem: houseSystem ?? "placidus",
      profileId: source.id,
      ...birthDateToQueryFields("birth", source.birthDate),
    }));
  };

  return (
    <MenuContainer titleKey="birthChart.title" mobileTitleKey="birthChart.titleMobile" loading={navigating}>
      <BirthChartForm onSubmit={handleSubmit} initialProfile={editProfile} />
    </MenuContainer>
  )
}