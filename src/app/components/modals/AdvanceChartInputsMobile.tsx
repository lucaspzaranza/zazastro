import { unitsArray } from "@/app/utils/chartUtils";
import { AdvanceChartUnitType } from "@/interfaces/AstroChartInterfaces";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface AdvanceChartMobileInputsProps {
  onChange?: (val: number, unit: AdvanceChartUnitType) => void;
}

export function AdvanceChartInputsMobile(props: AdvanceChartMobileInputsProps) {
  const { onChange } = props;

  const t = useTranslations();
  const [value, setValue] = useState(1);
  const [unit, setUnit] = useState<AdvanceChartUnitType>("minutes");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.value = value.toString();
    }
  }, []);

  return (
    <div className="flex flex-row items-center gap-2">
      <input
        ref={inputRef}
        type="number"
        className="w-10 h-[2rem] default-input-field border-black! pl-1! bg-zinc-50 text-center"
        required
        placeholder="0"
        onChange={(e) => {
          if (e.target.value.length > 0) {
            let val = Number.parseInt(e.target.value);

            if (val < 1) val = 0;
            if (val > 99) val = 99;

            setValue(val);
            onChange?.(val, unit);
            e.target.value = val.toString();
          }
        }}
      />

      <select
        className="default-input-field h-[2rem] border-black! text-center pt-1! bg-zinc-50"
        onChange={(e) => {
          setUnit(e.target.value as AdvanceChartUnitType);
          onChange?.(value, e.target.value as AdvanceChartUnitType);
        }}
        required
      >
        {unitsArray.map((unit, index) => (
          <option
            key={index}
            value={unit}
            className="text-start"
          >
            {t(`timeAdvanceModal.${unit}`)}
          </option>
        ))}
      </select>
    </div>
  )
}