import { presavedBirthDates } from "@/app/utils/chartUtils";
import { useProfiles } from "@/contexts/ProfilesContext";
import {
  BirthChartProfile,
  BirthDate,
} from "@/interfaces/BirthChartInterfaces";
import React from "react";

interface DropdownProps {
  disabled?: boolean;
  onChange?: (profile: BirthChartProfile) => void;
}

export default function PresavedChartsDropdown(props: DropdownProps) {
  const { disabled, onChange } = props;
  const { profiles } = useProfiles();

  return (
    <select
      disabled={disabled ?? false}
      className="p-1 border-2 rounded-sm w-full disabled:opacity-50"
      onChange={(e) => {
        const key = e.target.value;
        const profile = profiles.find((p) => p.name === key)!;
        // onChange?.(presavedBirthDates[key]);
        // console.log("key: ", key);

        onChange?.(profile);
      }}
    >
      {/* {Object.entries(presavedBirthDates).map(([name, date], index) => (
        <option key={index} value={name}>
          {date.name}
        </option>
      ))} */}

      {profiles.map((profile, index) => (
        <option key={index} value={profile.name}>
          {profile.name}
        </option>
      ))}
    </select>
  );
}
