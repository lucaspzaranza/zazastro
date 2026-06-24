// import {
//   formatSignColor,
//   getArabicPartImage,
//   getPlanetImage,
//   getZodiacRuler,
//   planesNamesByType,
// } from "@/app/utils/chartUtils";
// import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
// import { ArabicPart, FormulaDescription, FormulaElement } from "@/interfaces/ArabicPartInterfaces";
// import { useTranslations } from "next-intl";
// import Image from "next/image";
// import React from "react";

// interface ArabicPartsModalProps {
//   parts?: ArabicPart[];
//   onClose?: () => void;
// }

// export default function ArabicPartsModal(props: ArabicPartsModalProps) {
//   const { parts, onClose } = props;
//   const t = useTranslations();

//   const { isMobileBreakPoint } = useScreenDimensions();

//   function formatNumberToDegMin(long: number): string {
//     const longString = long.toFixed(2).replace(".", "°") + "'";
//     return longString;
//   }

//   function getRulerSpan(arabicPart: ArabicPart): React.ReactNode {
//     const ruler = getZodiacRuler(arabicPart.longitude);
//     const planetName = t(`planets.${ruler}`);
//     const planetIcon = getPlanetImage(ruler);

//     return (
//       <span className="flex flex-row items-center pl-1">
//         {planetIcon}&nbsp;{planetName}
//       </span>
//     );
//   }

//   function getAssociatedPlanet(arabicPart: ArabicPart): React.ReactNode {
//     const planetName = t(`planets.${arabicPart.planet!}`);
//     const planetIcon = getPlanetImage(arabicPart.planet!);

//     return (
//       <span className="flex flex-row items-center pl-1">
//         {planetIcon}&nbsp;{planetName}
//       </span>
//     );
//   }

//   const getTranslatedFormulaElement = (el: FormulaElement) => {
//     if(el.type === "planet")
//       return t(`planets.${el.key}`);
//     else if(el.type === "house") 
//       return t(`houses.${el.key}.acronym`);
//     else if(el.type === "arabicPart")
//       return t(`arabicParts.${el.key}.complete`);

//     return '';
//   }

//   function getFormulaDescription(formula: FormulaDescription): string {
//     const signals = formula.signals.split(", ");
//     const projected = getTranslatedFormulaElement(formula.projectedFrom);
//     const significator = getTranslatedFormulaElement(formula.significator);
//     const trigger = getTranslatedFormulaElement(formula.trigger);

//     return `${projected} ${signals[0]} ${significator} ${signals[1]} ${trigger}`;
//   }

//   return (
//     <div className="absolute w-[92vw] md:w-full md:left-0 h-[15vh] md:h-[80vh] flex flex-row items-center justify-center z-30">
//       <div className="w-full md:w-[41rem] h-[37rem] bg-gray-300 outline-2 rounded-md">
//         <header className="relative w-full h-[3rem] bg-white flex flex-row items-center rounded-md rounded-b-none justify-center border-b-2">
//           <h1 className="font-bold text-xl">{t("arabicParts.title")}</h1>
//           <button
//             className="absolute right-1 flex flex-row items-center justify-center"
//             onClick={() => {
//               onClose?.();
//             }}
//           >
//             <div className="absolute right-[2px] w-[25px] h-[25px] hover:opacity-20 hover:bg-gray-400 active:bg-gray-900" />
//             <Image
//               alt="close"
//               src="/close.png"
//               width={30}
//               height={30}
//               unoptimized
//             />
//           </button>
//         </header>

//         <div className="relative w-full h-[92%] rounded-sm rounded-t-0 z-20 p-3 overflow-auto">
//           <ul className="w-full pt-4 flex flex-col items-center justify-center gap-3">
//             {parts?.map((arabicPart, index) => {
//               return (
//                 <li
//                   key={index}
//                   className="bg-white outline-1 px-4 w-full flex flex-col items-center"
//                 >
//                   <span className="w-full flex flex-row items-center justify-start text-lg">
//                     <strong>{t(`arabicParts.${arabicPart?.partKey}.complete`)}</strong>&nbsp;
//                     {getArabicPartImage(arabicPart, {
//                       size: 18,
//                       isAntiscion: false,
//                     })}
//                   </span>
//                   <div className="w-full flex flex-row">
//                     <span className="w-[10rem] md:w-[12rem] flex flex-row items-center justify-start">
//                       Longitude:&nbsp;
//                       {formatSignColor(arabicPart.longitudeSign)}
//                     </span>
//                     <span className="w-[8rem] flex flex-row items-center pl-2">
//                       {isMobileBreakPoint() ? "Ant:" : "Antiscion:"}&nbsp;
//                       <span className="w-full text-end">
//                         {formatSignColor(arabicPart.antiscionSign)}
//                       </span>
//                     </span>
//                   </div>

//                   {arabicPart.planet && (
//                     <div className="w-full flex flex-row items-center justify-start">
//                       {t("arabicParts.associatedTo")}: {getAssociatedPlanet(arabicPart)}
//                     </div>
//                   )}

//                   {arabicPart.zodiacRuler && (
//                     <div className="w-full flex flex-row items-center justify-start">
//                       {t("arabicParts.ruler")}: {getRulerSpan(arabicPart)}
//                     </div>
//                   )}

//                   <div className="w-full flex flex-row items-center justify-start">
//                     {t("arabicParts.formula")}: {getFormulaDescription(arabicPart.formulaDescription)}
//                   </div>

//                   <div className="w-full flex flex-row items-center justify-start">
//                     {t("arabicParts.distanceFromBirthASC")}:{" "}
//                     {formatNumberToDegMin(arabicPart.distanceFromASC)}
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

import {
  formatSignColor,
  getArabicPartImage,
  getPlanetImage,
  getSign,
  getZodiacRuler,
  planesNamesByType,
} from "@/app/utils/chartUtils";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import { ArabicPart, FormulaDescription, FormulaElement } from "@/interfaces/ArabicPartInterfaces";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { IoClose } from "react-icons/io5";

interface ArabicPartsModalProps {
  parts?: ArabicPart[];
  onClose?: () => void;
}

// Mesmo agrupamento de elemento usado no AstroChart, pra manter a linguagem visual consistente
const signElements: Record<string, string> = {
  "♈︎": "Fogo",
  "♉︎": "Terra",
  "♊︎": "Ar",
  "♋︎": "Água",
  "♌︎": "Fogo",
  "♍︎": "Terra",
  "♎︎": "Ar",
  "♏︎": "Água",
  "♐︎": "Fogo",
  "♑︎": "Terra",
  "♒︎": "Ar",
  "♓︎": "Água",
};

// Paleta um pouco mais sóbria que as cores puras usadas no mapa (red/green/orange/blue),
// pensada pra cards e faixas laterais em vez de glifos sobre fundo branco.
const elementStyles: Record<string, { bar: string; chip: string; text: string }> = {
  Fogo: { bar: "bg-rose-500", chip: "bg-rose-50", text: "text-rose-800" },
  Terra: { bar: "bg-emerald-600", chip: "bg-emerald-50", text: "text-emerald-800" },
  Ar: { bar: "bg-amber-500", chip: "bg-amber-50", text: "text-amber-800" },
  Água: { bar: "bg-sky-500", chip: "bg-sky-50", text: "text-sky-800" },
};

export default function ArabicPartsModal(props: ArabicPartsModalProps) {
  const { parts, onClose } = props;
  const t = useTranslations();

  const { isMobileBreakPoint } = useScreenDimensions();

  function formatNumberToDegMin(long: number): string {
    const longString = long.toFixed(2).replace(".", "°") + "'";
    return longString;
  }

  function getElementStyle(arabicPart: ArabicPart) {
    const sign = getSign(arabicPart.longitude); // ex: "♍︎"
    const element = signElements[sign] ?? "Terra";
    return elementStyles[element];
  }

  function getRulerSpan(arabicPart: ArabicPart): React.ReactNode {
    const ruler = getZodiacRuler(arabicPart.longitude);
    const planetName = t(`planets.${ruler}`);
    const planetIcon = getPlanetImage(ruler);

    return (
      <span className="flex flex-row items-center gap-1">
        {planetIcon}
        {planetName}
      </span>
    );
  }

  function getAssociatedPlanet(arabicPart: ArabicPart): React.ReactNode {
    const planetName = t(`planets.${arabicPart.planet!}`);
    const planetIcon = getPlanetImage(arabicPart.planet!);

    return (
      <span className="flex flex-row items-center gap-1">
        {planetIcon}
        {planetName}
      </span>
    );
  }

  const getTranslatedFormulaElement = (el: FormulaElement) => {
    if (el.type === "planet")
      return t(`planets.${el.key}`);
    else if (el.type === "house")
      return t(`houses.${el.key}.acronym`);
    else if (el.type === "arabicPart")
      return t(`arabicParts.${el.key}.complete`);

    return '';
  }

  function getFormulaDescription(formula: FormulaDescription): string {
    const signals = formula.signals.split(", ");
    const projected = getTranslatedFormulaElement(formula.projectedFrom);
    const significator = getTranslatedFormulaElement(formula.significator);
    const trigger = getTranslatedFormulaElement(formula.trigger);

    return `${projected} ${signals[0]} ${significator} ${signals[1]} ${trigger}`;
  }

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center z-30 px-3">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => onClose?.()}
      />

      <div className="relative w-full md:w-[42rem] max-h-[85vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        <header className="relative w-full px-5 py-4 flex flex-row items-center justify-center border-b border-zinc-100">
          <h1 className="font-bold text-xl tracking-tight text-zinc-800">
            {t("arabicParts.title")}
          </h1>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
            onClick={() => onClose?.()}
          >
            <IoClose size={22} />
          </button>
        </header>

        <div className="w-full flex-1 overflow-y-auto px-4 py-4 bg-zinc-50">
          <ul className="w-full flex flex-col gap-3">
            {parts?.map((arabicPart, index) => {
              const style = getElementStyle(arabicPart);

              return (
                <li
                  key={index}
                  className="relative bg-white rounded-lg shadow-sm border border-zinc-100 overflow-hidden"
                >
                  {/* Faixa lateral colorida por elemento do signo */}
                  <span className={`absolute left-0 top-0 h-full w-1.5 ${style.bar}`} />

                  <div className="pl-5 pr-4 py-3 flex flex-col gap-1.5">
                    <div className="w-full flex flex-row items-center justify-between">
                      <span className="flex flex-row items-center gap-1.5 text-base font-semibold text-zinc-900">
                        {t(`arabicParts.${arabicPart?.partKey}.complete`)}
                        {getArabicPartImage(arabicPart, { size: 17, isAntiscion: false })}
                      </span>
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${style.chip} ${style.text}`}>
                        {formatSignColor(arabicPart.longitudeSign)}
                      </span>
                    </div>

                    <div className="w-full flex flex-row text-sm text-zinc-700">
                      <span className="w-[10rem] md:w-[12rem] flex flex-row items-center gap-1">
                        <span className="text-zinc-500">Longitude:</span>
                        {formatSignColor(arabicPart.longitudeSign)}
                      </span>
                      <span className="flex flex-row items-center gap-1 pl-2">
                        <span className="text-zinc-500">
                          {isMobileBreakPoint() ? "Ant:" : "Antiscion:"}
                        </span>
                        {formatSignColor(arabicPart.antiscionSign)}
                      </span>
                    </div>

                    {arabicPart.planet && (
                      <div className="w-full flex flex-row items-center gap-1 text-sm text-zinc-700">
                        <span className="text-zinc-500">{t("arabicParts.associatedTo")}:</span>
                        {getAssociatedPlanet(arabicPart)}
                      </div>
                    )}

                    {arabicPart.zodiacRuler && (
                      <div className="w-full flex flex-row items-center gap-1 text-sm text-zinc-700">
                        <span className="text-zinc-500">{t("arabicParts.ruler")}:</span>
                        {getRulerSpan(arabicPart)}
                      </div>
                    )}

                    <div className="w-full flex flex-row items-center gap-1 text-sm text-zinc-700">
                      <span className="text-zinc-500">{t("arabicParts.formula")}:</span>
                      <span className="text-zinc-800">{getFormulaDescription(arabicPart.formulaDescription)}</span>
                    </div>

                    <div className="w-full flex flex-row items-center gap-1 text-sm text-zinc-700">
                      <span className="text-zinc-500">{t("arabicParts.distanceFromBirthASC")}:</span>
                      <span className="text-zinc-800">{formatNumberToDegMin(arabicPart.distanceFromASC)}</span>
                    </div>
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