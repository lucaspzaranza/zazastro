import {
  allSigns,
  arabicPartKeys,
  clampLongitude,
  convertDegMinNumberToDecimal,
} from "@/app/utils/chartUtils";
import React, { useEffect, useState } from "react";
import ArabicPartsLayout from "../ArabicPartsLayout";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { ArabicPart } from "@/interfaces/ArabicPartInterfaces";
import { useArabicPartCalculations } from "@/hooks/useArabicPartCalculations";

interface ASCModalProps {
  baseParts?: ArabicPart[];
  onClose?: () => void;
}

export default function CustomizeASCModal(props: ASCModalProps) {
  const { baseParts, onClose } = props;

  const [calculatedParts, setCalculatedParts] = useState<
    ArabicPart[] | undefined
  >(undefined);
  const [partsToUse, setPartsToUse] = useState<ArabicPart[] | undefined>(
    calculatedParts ?? baseParts
  );
  const [signIndex, setSignIndex] = useState(0);
  const [customACMode, setCustomACMode] = useState(0);
  const [customAscendant, setCustomAscendant] = useState<number>(0);

  const { calculateBirthArchArabicPart } = useArabicPartCalculations();

  useEffect(() => {
    setPartsToUse([]);

    baseParts?.forEach((part) => {
      const newArchArabicPart = calculateBirthArchArabicPart(
        part,
        customAscendant
      );
      newArchArabicPart;
      setPartsToUse((prev) => [...prev!, newArchArabicPart]);
    });
  }, [customAscendant]);

  return (
    <div className="absolute w-[25.8rem] h-[80vh] flex flex-row top-[-22%] items-center justify-start z-10">
      <div className="w-[41rem] h-[25rem] bg-white outline-2">
        <header className="relative w-full h-[3rem] bg-white flex flex-row items-center justify-center outline-1">
          <h1 className="font-bold text-xl">Partes Árabes por Arco Natal</h1>
          <button
            className="absolute right-1 flex flex-row items-center justify-center"
            onClick={() => {
              onClose?.();
            }}
          >
            <div className="absolute w-[25px] h-[25px] hover:opacity-20 hover:bg-gray-400 active:bg-gray-900" />
            <img src="close.png" width={30} />
          </button>
        </header>

        <div className="p-3">
          <h3 className="text-xl font-bold mb-[-5px]">
            Personalizar Ascendente:
          </h3>
          <span className="w-full h-full flex flex-row items-center justify-center text-sm text-center p-1">
            Baseado no Ascendente do Mapa Natal
          </span>
          <div className="flex flex-row">
            <select
              className="mr-4 border-2 rounded-sm text-sm"
              onChange={(e) => {
                const val = Number.parseInt(e.target.value);
                setCustomACMode(val);
              }}
            >
              <option value={0}>Por Signo</option>
              <option value={1}>Por Grau</option>
            </select>

            {customACMode === 0 && (
              <div className="flex flex-row gap-2 text-sm">
                <select
                  className="border-2 rounded-sm"
                  onChange={(e) => {
                    setSignIndex(Number.parseInt(e.target.value));
                  }}
                >
                  {allSigns.map((sign, index) => {
                    return (
                      <option key={index} value={index}>
                        {sign}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="number"
                  className="border-2 rounded-sm w-[120px] p-1 text-sm"
                  placeholder="ex: 29.37"
                  onChange={(e) => {
                    const convertedString = clampLongitude(e.target.value, 29);
                    e.target.value =
                      e.target.value.length > 0
                        ? convertedString.toString()
                        : e.target.value;
                    const longitude =
                      convertDegMinNumberToDecimal(convertedString);
                    const value = signIndex * 30 + longitude;
                    setCustomAscendant(value > 0 ? value : 0);
                  }}
                />
              </div>
            )}

            {customACMode === 1 && (
              <input
                type="number"
                className="border-2 rounded-sm w-[120px] p-1 text-sm"
                placeholder="ex: 290.37"
                onChange={(e) => {
                  const convertedString = clampLongitude(e.target.value, 360);
                  e.target.value =
                    e.target.value.length > 0
                      ? convertedString.toString()
                      : e.target.value;
                  const value = convertDegMinNumberToDecimal(convertedString);
                  setCustomAscendant(value > 0 ? value : 0);
                }}
              />
            )}
          </div>
        </div>

        <div className="w-full flex flex-col items-start mt-2 px-3">
          <ArabicPartsLayout
            className="text-sm"
            partColWidth="w-min"
            antisciaColWidth="w-min"
            parts={partsToUse}
            showMenuButtons={false}
          />
        </div>
      </div>
    </div>
  );
}
