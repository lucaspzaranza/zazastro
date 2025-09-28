import { ArabicPart } from "@/interfaces/ArabicPartInterfaces";
import React, { useState } from "react";
import { formatSignColor, getArabicPartImage } from "../utils/chartUtils";
import ArabicPartsModal from "./modals/ArabicPartsModal";
import CustomizeASCModal from "./modals/CustomizeASCModal";
import ArabicPartCalculatorModal from "./modals/ArabicPartCalculatorModal";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import Image from "next/image";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import { useBirthChart } from "@/contexts/BirthChartContext";

interface ArabicPartsLayoutProps {
  title?: string;
  parts?: ArabicPart[];
  className?: string;
  showMenuButtons: boolean;
  partColWidth?: string;
  antisciaColWidth?: string;
  isInsideModal: boolean;
  onToggleInnerPartsVisualization?: (showOuterParts: boolean) => void;
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
    onToggleInnerPartsVisualization,
  } = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [customASCModal, setCustomASCModal] = useState(false);
  const [lotCalculator, setLotCalculator] = useState(false);
  const [showInnerParts, setShowInnerParts] = useState(true);

  const { isCombinedWithBirthChart, isCombinedWithReturnChart } =
    useBirthChart();

  const { isMobileBreakPoint } = useScreenDimensions();
  const { chartMenu } = useChartMenu();

  function toggleInnerPartsVisualization() {
    setShowInnerParts((prev) => !prev);
    onToggleInnerPartsVisualization?.(!showInnerParts);
  }

  function showSwitchPartsButton(): boolean {
    if (isInsideModal) return false;

    let result = chartMenu !== "birth";
    if (result) result = isCombinedWithBirthChart || isCombinedWithReturnChart;
    if (!result) result = chartMenu === "sinastry";

    return result;
  }

  return (
    <div className="text-sm md:text-[1rem] flex flex-col gap-2">
      <h2 className="text-lg flex flex-row items-center justify-between font-bold mt-[-5px]">
        <span className="w-fit flex flex-row items-center justify-start gap-1">
          {title ?? "Partes Árabes"}:{" "}
          {showSwitchPartsButton() && (
            <>
              <button
                title="Alterar entre partes internas e externas"
                className="hover:outline-2 outline-offset-4 hover:cursor-pointer active:bg-gray-300"
                onClick={() => {
                  toggleInnerPartsVisualization();
                }}
              >
                <Image
                  alt="change"
                  src="/change.png"
                  width={18}
                  height={18}
                  unoptimized
                />
              </button>
              {!showInnerParts && "(E)"}
            </>
          )}
        </span>
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
                unoptimized
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
                unoptimized
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
                unoptimized
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
