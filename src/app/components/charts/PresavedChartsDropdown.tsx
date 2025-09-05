import { presavedBirthDates } from "@/app/utils/chartUtils";
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

  return (
    <select
      disabled={disabled ?? false}
      className="p-1 border-2 rounded-sm w-full disabled:opacity-50"
      onChange={(e) => {
        const key = e.target.value;
        onChange?.(presavedBirthDates[key]);
      }}
    >
      {Object.entries(presavedBirthDates).map(([name, date], index) => (
        <option key={index} value={name}>
          {date.name}
        </option>
      ))}
    </select>
  );
}
