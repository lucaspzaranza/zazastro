import { useArabicPartCalculatorItems } from "@/hooks/useArabicPartCalculatorItems";
import { ArabicPartCalculatorDropdownItem } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";

interface ArabicPartCalculatorDropdownProps {
  label: string;
  onSelect?: (element: ArabicPartCalculatorDropdownItem) => void;
}

export default function ArabicPartCalculatorDropdown(
  props: ArabicPartCalculatorDropdownProps
) {
  const { label, onSelect } = props;
  const items = useArabicPartCalculatorItems();
  const t = useTranslations();

  const flatMap = new Map<string, ArabicPartCalculatorDropdownItem>();

  Object.values(items).forEach((group) =>
    group.forEach((item) => flatMap.set(item.key, item))
  );

  return (
    <div className="flex flex-col text-sm gap-1">
      <label className="text-nowrap">{label}</label>
      <select
        className="w-full py-1 md:w-[7.5rem] default-input-field bg-white"
        defaultValue={items["angles"][0].key}
        onChange={(e) => {
          const selected = flatMap.get(e.target.value);
          if (selected) {
            onSelect?.(selected);
          }
        }}
      >
        {Object.entries(items).map(([group, items]) => (
          <optgroup key={group} label={t(`arabicParts.${group}`)}>
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
