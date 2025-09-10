import { arabicPartCalculatorItems } from "@/app/utils/chartUtils";
import { ArabicPartCalculatorDropdownItem } from "@/interfaces/ArabicPartInterfaces";
import { ChartElement } from "@/interfaces/AstroChartInterfaces";
import React, { useState } from "react";

interface ArabicPartCalculatorDropdownProps {
  label: string;
  onSelect?: (element: ArabicPartCalculatorDropdownItem) => void;
}

export default function ArabicPartCalculatorDropdown(
  props: ArabicPartCalculatorDropdownProps
) {
  const { label, onSelect } = props;
  const items = arabicPartCalculatorItems;

  const flatMap = new Map<string, ArabicPartCalculatorDropdownItem>();

  Object.values(items).forEach((group) =>
    group.forEach((item) => flatMap.set(item.key, item))
  );

  return (
    <div className="flex flex-col text-sm gap-1">
      <label>{label}</label>
      <select
        className="w-[7.5rem] border-2 rounded-sm"
        defaultValue={items["Ângulos"][0].key}
        onChange={(e) => {
          const selected = flatMap.get(e.target.value);
          if (selected) {
            onSelect?.(selected);
          }
        }}
      >
        {Object.entries(items).map(([group, items]) => (
          <optgroup key={group} label={group}>
            {items.map((item) => (
              <option key={item.key} value={item.key}>
                {item.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
