import {
  formatSignColor,
  getArabicPartImage,
  getPlanetImage,
  getZodiacRuler,
  planesNamesByType,
} from "@/app/utils/chartUtils";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import { ArabicPart } from "@/interfaces/ArabicPartInterfaces";
import React from "react";

interface ArabicPartsModalProps {
  parts?: ArabicPart[];
  onClose?: () => void;
}

export default function ArabicPartsModal(props: ArabicPartsModalProps) {
  const { parts, onClose } = props;

  const { isMobileBreakPoint } = useScreenDimensions();

  function formatNumberToDegMin(long: number): string {
    const longString = long.toFixed(2).replace(".", "°") + "'";
    return longString;
  }

  function getRulerSpan(arabicPart: ArabicPart): React.ReactNode {
    const ruler = getZodiacRuler(arabicPart.longitude);
    const planetName = planesNamesByType[ruler];
    const planetIcon = getPlanetImage(ruler);

    return (
      <span className="flex flex-row items-center pl-1">
        {planetIcon}&nbsp;{planetName}
      </span>
    );
  }

  function getAssociatedPlanet(arabicPart: ArabicPart): React.ReactNode {
    const planetName = planesNamesByType[arabicPart.planet!];
    const planetIcon = getPlanetImage(arabicPart.planet!);

    return (
      <span className="flex flex-row items-center pl-1">
        {planetIcon}&nbsp;{planetName}
      </span>
    );
  }

  return (
    <div className="absolute w-full md:w-[98vw] h-full md:h-[80vh] flex flex-row items-center justify-center z-20 md:z-auto">
      <div className="w-[41rem] h-[31rem] bg-gray-300 border-2">
        <header className="relative w-full h-[3rem] bg-white flex flex-row items-center justify-center border-b-2">
          <h1 className="font-bold text-xl">Partes Árabes</h1>
          <button
            className="absolute right-1 flex flex-row items-center justify-center"
            onClick={() => {
              onClose?.();
            }}
          >
            <div className="w-[25px] h-[25px] hover:opacity-20 hover:bg-gray-400 active:bg-gray-900" />
            <img src="close.png" width={30} />
          </button>
        </header>

        <div className="relative w-full h-[27.2rem] rounded-sm rounded-t-0 z-20 p-3 overflow-auto">
          <ul className="w-full pt-4 flex flex-col items-center justify-center gap-3">
            {parts?.map((arabicPart, index) => {
              return (
                <li
                  key={index}
                  className="bg-white outline-1 px-4 w-full flex flex-col items-center"
                >
                  <span className="w-full flex flex-row items-center justify-start text-lg">
                    <strong>{arabicPart?.name}</strong>&nbsp;
                    {getArabicPartImage(arabicPart, {
                      size: 18,
                      isAntiscion: false,
                    })}
                  </span>
                  <div className="w-full flex flex-row">
                    <span className="w-[10rem] md:w-[12rem] flex flex-row items-center justify-start">
                      Longitude:&nbsp;
                      {formatSignColor(arabicPart.longitudeSign)}
                    </span>
                    <span className="w-[8rem] flex flex-row items-center pl-2">
                      {isMobileBreakPoint() ? "Ant:" : "Antiscion:"}
                      <span className="w-full text-end">
                        {formatSignColor(arabicPart.antiscionSign)}
                      </span>
                    </span>
                  </div>

                  {arabicPart.planet && (
                    <div className="w-full flex flex-row items-center justify-start">
                      Associada a: {getAssociatedPlanet(arabicPart)}
                    </div>
                  )}

                  {arabicPart.zodiacRuler && (
                    <div className="w-full flex flex-row items-center justify-start">
                      Dispositor: {getRulerSpan(arabicPart)}
                    </div>
                  )}

                  <div className="w-full flex flex-row items-center justify-start">
                    Fórmula: {arabicPart.formulaDescription}
                  </div>

                  <div className="w-full flex flex-row items-center justify-start">
                    Distância pro Ascendente Natal:{" "}
                    {formatNumberToDegMin(arabicPart.distanceFromASC)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
