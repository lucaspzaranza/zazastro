import { ArabicPart } from "@/interfaces/ArabicPartInterfaces";
import React, { useState } from "react";
import { formatSignColor, getArabicPartImage } from "../utils/chartUtils";
import ArabicPartsModal from "./modals/ArabicPartsModal";
import CustomizeASCModal from "./modals/CustomizeASCModal";
import ArabicPartCalculatorModal from "./modals/ArabicPartCalculatorModal";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import Image from "next/image";

interface ArabicPartsLayoutProps {
  title?: string;
  parts?: ArabicPart[];
  className?: string;
  showMenuButtons: boolean;
  partColWidth?: string;
  antisciaColWidth?: string;
  isInsideModal: boolean;
}

export default function ArabicPartsLayout(props: ArabicPartsLayoutProps) {
  const {
    title,
    parts,
    className,
    showMenuButtons,
    partColWidth,
    antisciaColWidth,
    isInsideModal,
  } = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [customASCModal, setCustomASCModal] = useState(false);
  const [lotCalculator, setLotCalculator] = useState(false);

  const { isMobileBreakPoint } = useScreenDimensions();

  return (
    <div className="w-full text-sm md:text-[1rem] flex flex-col gap-2">
      <h2 className="text-lg flex flex-row items-center justify-between font-bold mt-[-5px]">
        {title ?? "Partes Árabes"}:
        {showMenuButtons && (
          <div className="h-full flex flex-row items-center justify-between gap-3">
            <button
              title="Calcular Parte Árabe"
              className="hover:outline-2 outline-offset-4"
              onClick={() => {
                setLotCalculator(true);
              }}
            >
              <Image
                alt="dropdown"
                src="/dropdown-menu.png"
                width={20}
                height={20}
              />
            </button>

            <button
              title="Personalizar Ascendente"
              className="hover:outline-2 outline-offset-4"
              onClick={() => {
                setCustomASCModal(true);
              }}
            >
              <Image
                alt="customize"
                src="/customize.png"
                width={20}
                height={20}
              />
            </button>
            <button
              title="Ver mais"
              className="hover:outline-2 outline-offset-4"
              onClick={() => {
                setModalIsOpen(true);
              }}
            >
              <Image
                alt="more info"
                src="/see-more.png"
                width={20}
                height={20}
              />
            </button>
          </div>
        )}
      </h2>
      <ul className={className}>
        {parts?.map((arabicPart, index) => {
          return (
            <li key={index} className="flex flex-row items-center">
              <div className="w-full flex flex-row justify-between">
                <span
                  className={`w-[14rem] flex flex-row items-center justify-between
                    ${partColWidth}`}
                >
                  <span
                    className={`${
                      isInsideModal ? "w-[8rem]" : "w-[9rem]"
                    } flex flex-row items-center justify-between`}
                  >
                    <span>{arabicPart?.name}</span>

                    <span className="w-full flex flex-row items-center justify-end md:pr-1">
                      {getArabicPartImage(arabicPart, {
                        size: isMobileBreakPoint() ? 12 : 15,
                      })}
                      :
                    </span>
                  </span>
                  <span
                    className={`${
                      isInsideModal ? "w-[4rem]" : "w-[5rem]"
                    } text-end md:pr-3`}
                  >
                    {formatSignColor(arabicPart.longitudeSign)}
                  </span>
                </span>

                <span
                  className={`w-full md:w-[12rem] flex flex-row items-center md:pl-2 ${antisciaColWidth}`}
                >
                  {isMobileBreakPoint() && isInsideModal
                    ? "Ant:"
                    : "Antiscion:"}
                  &nbsp;
                  <span className="w-full md:text-end">
                    {formatSignColor(arabicPart.antiscionSign)}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {showMenuButtons && (
        <>
          {lotCalculator && (
            <ArabicPartCalculatorModal
              onClose={() => setLotCalculator(false)}
            />
          )}

          {customASCModal && (
            <CustomizeASCModal
              baseParts={parts}
              onClose={() => {
                setCustomASCModal(false);
              }}
            />
          )}

          {modalIsOpen && (
            <ArabicPartsModal
              parts={parts}
              onClose={() => {
                setModalIsOpen(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
