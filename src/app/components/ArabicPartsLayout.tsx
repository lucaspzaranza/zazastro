import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import React, { useEffect, useState } from "react";
import { formatSignColor, getArabicPartImage } from "../utils/chartUtils";
import ArabicPartsModal from "./modals/ArabicPartsModal";
import CustomizeASCModal from "./modals/CustomizeASCModal";

interface ArabicPartsLayoutProps {
  title?: string;
  parts?: ArabicPart[];
  className?: string;
  showMenuButtons: boolean;
  partColWidth?: string;
  antisciaColWidth?: string;
}

export default function ArabicPartsLayout(props: ArabicPartsLayoutProps) {
  const {
    title,
    parts,
    className,
    showMenuButtons,
    partColWidth,
    antisciaColWidth,
  } = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [customASCModal, setCustomASCModal] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl flex flex-row items-center justify-between font-bold mt-[-5px]">
        {title ?? "Partes Árabes"}:
        {showMenuButtons && (
          <div className="h-full flex flex-row items-center justify-between gap-3">
            <button
              title="Personalizar Ascendente"
              className="hover:outline-2 outline-offset-4"
              onClick={() => {
                setCustomASCModal(true);
              }}
            >
              <img src="customize.png" width={20} />
            </button>
            <button
              title="Ver mais"
              className="hover:outline-2 outline-offset-4"
              onClick={() => {
                setModalIsOpen(true);
              }}
            >
              <img src="see-more.png" width={20} />
            </button>
          </div>
        )}
      </h2>
      <ul className={className}>
        {parts?.map((arabicPart, index) => {
          return (
            <li key={index} className="flex flex-row items-center">
              <div className="w-full flex flex-row">
                <span
                  className={`w-[14rem] flex flex-row items-center justify-between 
                    ${partColWidth}`}
                >
                  <span className="w-[9rem] flex flex-row items-center justify-between">
                    <span>{arabicPart?.name}</span>
                    <span className="w-full flex flex-row items-center justify-end pr-1">
                      {getArabicPartImage(arabicPart)}:
                    </span>
                  </span>
                  <span className="w-[5rem] text-end pr-3">
                    {formatSignColor(arabicPart.longitudeSign)}
                  </span>
                </span>
                <span
                  className={`w-[12rem] flex flex-row items-center pl-2 ${antisciaColWidth}`}
                >
                  Antiscion:&nbsp;
                  <span className="w-full text-end">
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
