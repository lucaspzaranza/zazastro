import { ResolvedChartDate } from "@/hooks/useResolvedChartDate";
import { useState } from "react";

export default function ChartHeaderSubtitle(props: {blocks: ResolvedChartDate[]}) {
  const { blocks } = props;

  const [metadataExpanded, setMetadataExpanded] = useState(false);

  // Filtra blocos ainda não resolvidos (useResolvedChartDate retorna
  // undefined até a primeira resolução assíncrona terminar).
  const resolvedBlocks = blocks.filter((b): b is ResolvedChartDate => b !== undefined);
  const hasMultipleresolvedBlocks = resolvedBlocks.length > 1;

  // Resumo curto mostrado quando colapsado, ex: "2 mapas" ou, quando
  // possível, algo mais descritivo como "Natal e trânsitos".
  const collapsedSummaryLabel = `${resolvedBlocks.length} ${resolvedBlocks.length === 1 ? "mapa" : "mapas"}`;

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
          {resolvedBlocks[0].formattedText}
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