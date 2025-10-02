import { ArabicPart } from "@/interfaces/ArabicPartInterfaces";
import React, { JSX, useState } from "react";
import { formatSignColor, getArabicPartImage } from "../utils/chartUtils";
import ArabicPartsModal from "./modals/ArabicPartsModal";
import CustomizeASC from "./CustomizeASC";
import ArabicPartCalculator from "./ArabicPartCalculator";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import Image from "next/image";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import { useBirthChart } from "@/contexts/BirthChartContext";

type ArabicPartsMenu = "default" | "customizeASC" | "lotCalculator";

interface ArabicPartsLayoutProps {
  title?: string;
  parts?: ArabicPart[];
  className?: string;
  showMenuButtons: boolean;
  partColWidth?: string;
  antisciaColWidth?: string;
  showSwitchParts: boolean;
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
    showSwitchParts,
    onToggleInnerPartsVisualization,
  } = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showInnerParts, setShowInnerParts] = useState(true);
  const [menu, setMenu] = useState<ArabicPartsMenu>("default");

  const { isCombinedWithBirthChart, isCombinedWithReturnChart } =
    useBirthChart();

  const { isMobileBreakPoint } = useScreenDimensions();
  const { chartMenu } = useChartMenu();

  function toggleInnerPartsVisualization() {
    setShowInnerParts((prev) => !prev);
    onToggleInnerPartsVisualization?.(!showInnerParts);
  }

  function showSwitchPartsButton(): boolean {
    if (!showSwitchParts || menu !== "default") return false;

    let result = chartMenu !== "birth";
    if (result) result = isCombinedWithBirthChart || isCombinedWithReturnChart;
    if (!result) result = chartMenu === "sinastry";

    return result;
  }

  const getTitle = () => {
    if (title) return title;

    if (menu === "default") return "Partes Árabes:";
    if (menu === "customizeASC") return "Personalizar Ascendente:";
    if (menu === "lotCalculator") return "Calcular Parte Árabe:";
  }

  function renderTitleAndMenuBtns(): JSX.Element {
    return <h2 className="text-lg flex flex-row items-center justify-between font-bold mt-[-5px]">
      <span className="w-fit flex flex-row items-center justify-start gap-1">
        {getTitle()}
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
            title="Partes Árabes"
            className={`hover:outline-2 outline-offset-4 ${menu === "default" ? "outline-2" : ""
              }`}
            onClick={() => {
              setMenu("default");
            }}
          >
            <Image
              alt="fortune"
              src="/planets/fortune.png"
              width={20}
              height={20}
              unoptimized
            />
          </button>

          <button
            title="Calcular Parte Árabe"
            className={`hover:outline-2 outline-offset-4 ${menu === "lotCalculator" ? "outline-2 outline-offset-4" : ""
              }`}
            onClick={() => {
              setMenu("lotCalculator");
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
            className={`hover:outline-2 outline-offset-4 ${menu === "customizeASC" ? "outline-2 outline-offset-4" : ""
              }`}
            onClick={() => {
              setMenu("customizeASC");
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
  }

  const renderArabicPartsDefaultDetails = (): JSX.Element => {
    return <>
      <ul className={className}>
        {parts?.map((arabicPart, index) => {
          return (
            <li key={index} className="flex flex-row items-center">
              <div className="w-full flex flex-row justify-between">
                <span
                  className={`w-[14rem] md:w-[14rem] flex flex-row items-center justify-between
                    ${partColWidth}`}
                >
                  <span
                    className="w-[8rem] md:w-[9rem] flex flex-row items-center justify-between"
                  >
                    <span>{arabicPart?.name}</span>

                    <span className="w-full flex flex-row items-center justify-end mr-4 md:mr-0 md:pr-1">
                      {getArabicPartImage(arabicPart, {
                        size: isMobileBreakPoint() ? 12 : 15,
                      })}
                      :
                    </span>
                  </span>
                  <span
                    className={`w-[4rem] md:w-[5rem] text-end ml-[-15px] md:pr-3`}
                  >
                    {formatSignColor(arabicPart.longitudeSign)}
                  </span>
                </span>

                <span
                  className={`w-full md:w-[12rem] flex flex-row items-center pl-2 gap-1 ${antisciaColWidth}`}
                >
                  Antiscion:
                  <span className="w-[4rem] md:w-full text-end">
                    {formatSignColor(arabicPart.antiscionSign)}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul></>
  }

  return (
    <div className="text-sm md:text-[1rem] flex flex-col gap-2">
      {renderTitleAndMenuBtns()}

      {menu === "default" && renderArabicPartsDefaultDetails()}

      {showMenuButtons && (
        <>
          {menu === "lotCalculator" && (
            <ArabicPartCalculator
            />
          )}

          {menu === "customizeASC" && (
            <CustomizeASC
              baseParts={parts}
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
