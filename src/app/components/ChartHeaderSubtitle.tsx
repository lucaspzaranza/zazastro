import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import { ResolvedChartDate } from "@/hooks/useResolvedChartDate";
import { ChartType } from "@/interfaces/BirthChartInterfaces";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

export default function ChartHeaderSubtitle(props: {blocks: ResolvedChartDate[]}) {
  const { blocks } = props;
  const [metadataExpanded, setMetadataExpanded] = useState(false);
  const { chartMenu } = useChartMenu();
  const { birthChart } = useBirthChart();
  const t = useTranslations();
  const { isMobileBreakPoint } = useScreenDimensions();

  // Filtra blocos ainda não resolvidos (useResolvedChartDate retorna
  // undefined até a primeira resolução assíncrona terminar).
  const resolvedBlocks = blocks.filter((b): b is ResolvedChartDate => b !== undefined);
  const hasMultipleresolvedBlocks = resolvedBlocks.length > 1;

  // Resumo curto mostrado quando colapsado, ex: "2 mapas" ou, quando
  // possível, algo mais descritivo como "Natal e trânsitos".
  const collapsedSummaryLabel = `${resolvedBlocks.length} ${resolvedBlocks.length === 1 ? "mapa" : "mapas"}`;
  
  const iconSize = 12;

  const getDayOrNightLabel = (isDiurnal: boolean) => {
    return <div className="flex items-center justify-center gap-1 text-[12px] md:text-[14px] text-zinc-800 ml-1">
      <Image src={`/planets/${isDiurnal? "sun" : "moon"}.png`} width={iconSize} height={iconSize} unoptimized alt="Day/Night"/>
      {isDiurnal ? `${t("birthChart.dayMap")}` : `${t("birthChart.nightMap")}`}
    </div>
  }

  return resolvedBlocks.length > 0 &&
    <div className="w-full flex flex-col items-center">
      {!hasMultipleresolvedBlocks ? (
        <span
          className="text-[12px] md:text-[14px] text-zinc-800 text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
          title={
            resolvedBlocks[0].label
              ? `${resolvedBlocks[0].label}: ${resolvedBlocks[0].formattedText}`
              : resolvedBlocks[0].formattedText
          }
        >
          {resolvedBlocks[0].label && (
            <span className="font-semibold text-zinc-700">{resolvedBlocks[0].label}: </span>
          )}
          
          {
            isMobileBreakPoint() ? <>
              {resolvedBlocks[0].formattedText}
              {(chartMenu === "birth" || chartMenu === "moment") && birthChart?.isDiurnal !== undefined && (
                getDayOrNightLabel(birthChart.isDiurnal)
              )}
            </> :
            <div className="inline-flex items-center gap-1">
              {resolvedBlocks[0].formattedText}
              {(chartMenu === "birth" || chartMenu === "moment") && birthChart?.isDiurnal !== undefined && (
                getDayOrNightLabel(birthChart.isDiurnal)
              )}
            </div>
          }
        </span>
      ) : (
        <>
          {/* <button
            onClick={() => setMetadataExpanded((prev) => !prev)}
            className="text-[14px] text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            {collapsedSummaryLabel}
            <span
              className="transition-transform"
            >
              {metadataExpanded? "🔼": "🔽" }
            </span>
          </button> */}

          {(metadataExpanded || true) && (
            <div className="w-full flex flex-col gap-0 mt-0 px-2 py-1">
              {resolvedBlocks.map((block, index) => (
                <div
                  key={index}
                  className="flex items-baseline justify-center gap-1.5 text-[12px] md:text-[14px] text-zinc-600"
                >
                  {block.label && (
                    <span className="font-semibold text-zinc-800 flex-shrink-0">
                      {block.label}:
                    </span>
                  )}
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {block.formattedText}                        
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
}