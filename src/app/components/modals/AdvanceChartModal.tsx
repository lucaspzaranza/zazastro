import { unitsArray } from "@/app/utils/chartUtils";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import { AdvanceChartUnitType } from "@/interfaces/AstroChartInterfaces";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

interface AdvanceChartModalProps {
  inputValue: number;
  unitProp: AdvanceChartUnitType;
  onSubmit?: (val: number, unit: AdvanceChartUnitType) => void;
  onClose?: () => void;
}

export default function AdvanceChartModal(props: AdvanceChartModalProps) {
  const { inputValue, unitProp, onSubmit, onClose } = props;

  const { isMobileBreakPoint } = useScreenDimensions();
  const t = useTranslations();

  const [value, setValue] = useState(1);
  const [unit, setUnit] = useState<AdvanceChartUnitType>("minutes");
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);  

  useEffect(() => {
    if(inputRef.current) {
      setValue(inputValue);
      inputRef.current.value = inputValue.toString();
    }

    if(selectRef.current) {
      setUnit(unitProp);
      selectRef.current.value = unitProp.toString();
    }
  }, []);

  return (
    <div  className="fixed inset-0 w-full h-full flex items-center justify-center z-50 px-3">
      {!isMobileBreakPoint() &&
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => onClose?.()}
        />
      }

      <form className="relative max-w-md rounded-xl shadow-xl bg-white right-0 mr-[-60px] top-9 flex flex-col items-start z-40"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(value, unit);
          onClose?.();
        }}
      >
        <header className="relative w-full flex flex-row items-center justify-center p-2">
          <h1 className="font-bold tracking-tight text-zinc-600 text-center">
              {t("timeAdvanceModal.title")}
            </h1>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 mb-0.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
            type="button"
            onClick={() => onClose?.()}
          >
            <IoClose size={20} />
          </button>
        </header>

        <div className="flex flex-row gap-2 p-3 bg-zinc-50 rounded-b-xl">
          <input
            ref={inputRef}
            type="number"
            className="w-16 md:w-20 default-input-field h-8"
            required
            placeholder="0"
            onChange={(e) => {
              if (e.target.value.length > 0) {
                let val = Number.parseInt(e.target.value);

                if (val < 1) val = 0;
                if (val > 99) val = 99;

                setValue(val);
                e.target.value = val.toString();
              }
            }}
          />

          <select
            ref={selectRef}
            className="flex-1 default-input-field h-8"
            onChange={(e) =>
              setUnit(e.target.value as AdvanceChartUnitType)
            }
            required
          >
            {unitsArray.map((unit, index) => (
              <option
                key={index}
                value={unit}
              >
                {t(`timeAdvanceModal.${unit}`)}
              </option>
            ))}
          </select>

          <button type="submit" className="default-btn h-8">
            {t("timeAdvanceModal.apply")}
          </button>
        </div>
      </form>
    </div>
  )
}