// src/app/components/charts/PresavedChartsDropdown.tsx
import { useProfiles } from "@/contexts/ProfilesContext";
import { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";
import React from "react";

interface DropdownProps {
  disabled?: boolean;
  onChange?: (profile: BirthChartProfile) => void;
  /**
   * Quando true, perfis com gender "event" aparecem na lista mas não podem
   * ser selecionados — mapas de evento não fazem sentido em retornos,
   * trânsitos, sinastria, progressão ou profecção.
   */
  excludeEventProfiles?: boolean;
}

export default function PresavedChartsDropdown(props: DropdownProps) {
  const { disabled, onChange, excludeEventProfiles } = props;
  const { profiles } = useProfiles();

  const isProfileDisabled = (profile: BirthChartProfile) =>
    excludeEventProfiles === true && profile.gender === "event";

  const firstEnabledProfile = profiles.find((p) => !isProfileDisabled(p));

  return (
    <select
      disabled={disabled ?? false}
      defaultValue={firstEnabledProfile?.name}
      className="w-full default-input-field bg-zinc-50 disabled:opacity-50"
      onChange={(e) => {
        const key = e.target.value;
        const profile = profiles.find((p) => p.name === key)!;
        onChange?.(profile);
      }}
    >
      {profiles.map((profile, index) => (
        <option key={index} value={profile.name} disabled={isProfileDisabled(profile)}>
          {profile.name}
        </option>
      ))}
    </select>
  );
}