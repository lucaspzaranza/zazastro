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
import { BsThreeDots } from "react-icons/bs";

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
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

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
    if (menu === "customizeASC") return "Personalizar\nAscendente:";
    if (menu === "lotCalculator") return "Calcular Parte Árabe:";
  }

  function renderMenuButtons(): JSX.Element {
    return <>
      <button
        title="Partes Árabes"
        className={`rounded-sm hover:outline-2 hover:scale-110 outline-offset-4 ${menu === "default" ? "outline-2 scale-110" : ""
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
        className={`rounded-sm hover:outline-2 hover:scale-110 outline-offset-4 ${menu === "lotCalculator" ? "outline-2 scale-110" : ""
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
        className={`rounded-sm hover:outline-2 hover:scale-110 outline-offset-4 ${menu === "customizeASC" ? "outline-2 scale-110" : ""
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
        className="rounded-sm hover:outline-2 hover:scale-110 outline-offset-4"
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
    </>
  }

  function renderMenuButtonsForMobile(): JSX.Element {
    return <>
      <button
        title="Partes Árabes"
        className="w-full flex gap-2 p-2 pl-1 flex-row items-center active:bg-blue-100"
        onClick={() => {
          setMenu("default");
          setContextMenuOpen(prev => !prev);
        }}
      >
        <Image
          alt="fortune"
          src="/planets/fortune.png"
          width={20}
          height={20}
          unoptimized
        />
        <span className="text-sm font-normal">Partes Árabes</span>
      </button >

      <button
        title="Calcular Parte Árabe"
        className="w-full flex gap-2 p-2 pl-1 flex-row items-center active:bg-blue-100"
        onClick={() => {
          setMenu("lotCalculator");
          setContextMenuOpen(prev => !prev);
        }}
      >
        <Image
          alt="dropdown"
          src="/dropdown-menu.png"
          width={20}
          height={20}
          unoptimized
        />
        <span className="text-sm font-normal">Calcular Parte Árabe</span>
      </button>

      <button
        title="Personalizar Ascendente"
        className="w-full flex gap-2 p-2 pl-1 flex-row items-center active:bg-blue-100"
        onClick={() => {
          setMenu("customizeASC");
          setContextMenuOpen(prev => !prev);
        }}
      >
        <Image
          alt="customize"
          src="/customize.png"
          width={20}
          height={20}
          unoptimized
        />
        <span className="text-sm font-normal">Personalizar Ascendente</span>
      </button>
      <button
        title="Ver mais"
        className="w-full flex gap-2 p-2 pl-1 flex-row items-center active:bg-blue-100"
        onClick={() => {
          setModalIsOpen(true);
          setContextMenuOpen(prev => !prev);
        }}
      >
        <Image
          alt="more info"
          src="/see-more.png"
          width={20}
          height={20}
          unoptimized
        />
        <span className="text-sm font-normal">Ver Mais Detalhes</span>
      </button>
    </>
  }

  function renderTitleAndMenuBtns(): JSX.Element {
    return <h2 className="text-lg flex flex-row items-center justify-between font-bold mt-[-5px]">
      <span className="w-fit flex flex-row items-center justify-start gap-1">
        {getTitle()}
        {showSwitchPartsButton() && (
          <>
            <button
              title="Alterar entre partes internas e externas"
              className="rounded-sm hover:outline-2 outline-offset-4 hover:cursor-pointer active:bg-gray-300"
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
        <>
          <div className="md:hidden relative">
            <BsThreeDots size={20} onClick={() => {
              setContextMenuOpen(prev => !prev);
            }} />

            {contextMenuOpen &&
              (<div className="absolute w-[16rem] bg-white shadow px-2 py-3 right-0 top-5 flex flex-col items-start z-30">
                {renderMenuButtonsForMobile()}
              </div>)}
          </div>

          <div className="h-full hidden md:flex flex-row items-center justify-between gap-4">
            {renderMenuButtons()}
          </div>
        </>
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
