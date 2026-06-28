"use client";

import React, { useState } from "react";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import Image from "next/image";
import { ResolvedChartDate } from "@/hooks/useResolvedChartDate";

interface ChartHeaderProps {
  /** Título do mapa. Pode ser string ou ReactNode (ex: nome + símbolo de gênero). */
  title?: React.ReactNode;
  /**
   * Blocos de metadados já resolvidos (ver useResolvedChartDate), na ordem em
   * que devem aparecer. 1 bloco = mostra direto. 2+ blocos = colapsa em um
   * resumo clicável que expande sob demanda.
   */
  dateBlocks: ResolvedChartDate[];
  /** Mostra o ícone de gênero ao lado do título (ex: mapas não-sinastria). */
  genderIconPath?: string;
  genderIconSize?: number;
}

/**
 * Cabeçalho compacto do mapa astral: título em uma linha truncada (com
 * tooltip nativo via `title` no hover) + linha de metadados que colapsa
 * automaticamente quando há mais de um bloco de data (sinastria, trânsitos).
 *
 * Absorve a navegação entre mapas que antes vivia em ChartSelectorArrows,
 * já que esse componente não era reutilizado em nenhum outro lugar.
 */
export default function ChartHeader(props: ChartHeaderProps) {
  const { title, dateBlocks, genderIconPath, genderIconSize = 18 } = props;
  const [metadataExpanded, setMetadataExpanded] = useState(false);

  const { isFirstChart, isLastChart, nextChartMenu, previousChartMenu } = useChartMenu();
  const { updateIsCombinedWithBirthChart, updateIsCombinedWithReturnChart } = useBirthChart();

  const goToPrevious = () => {
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);
    previousChartMenu();
  };

  const goToNext = () => {
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);
    nextChartMenu();
  };

  // Filtra blocos ainda não resolvidos (useResolvedChartDate retorna
  // undefined até a primeira resolução assíncrona terminar).
  const resolvedBlocks = dateBlocks.filter((b): b is ResolvedChartDate => b !== undefined);
  const hasMultipleBlocks = resolvedBlocks.length > 1;

  // Resumo curto mostrado quando colapsado, ex: "2 mapas" ou, quando
  // possível, algo mais descritivo como "Natal e trânsitos".
  const collapsedSummaryLabel = `${resolvedBlocks.length} ${resolvedBlocks.length === 1 ? "mapa" : "mapas"}`;

  return (
    <div className="w-full flex flex-col gap-1 px-3">
      {/* Linha 1: navegação + título truncado */}
      <div className="w-full flex items-center gap-1.5">
        <button
          disabled={isFirstChart()}
          onClick={goToPrevious}
          title="Menu anterior"
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <span className="text-sm leading-none">◀</span>
        </button>

        <div className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-1">
          {typeof title === "string" ? (
            <span
              className="text-[13px] font-semibold text-zinc-800 whitespace-nowrap overflow-hidden text-ellipsis"
              title={title}
            >
              {title}
            </span>
          ) : (
            // Quando title é um ReactNode complexo (ex: com símbolo embutido),
            // não há texto puro para o atributo `title` nativo de tooltip —
            // o truncamento ainda se aplica visualmente, mas sem fallback de
            // texto completo no hover nesse caso específico.
            <span className="text-[13px] font-semibold text-zinc-800 whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1">
              {title}
            </span>
          )}

          {genderIconPath && (
            <Image
              src={genderIconPath}
              width={genderIconSize}
              height={genderIconSize}
              alt="genderIcon"
              unoptimized
              className="flex-shrink-0"
            />
          )}
        </div>

        <button
          disabled={isLastChart()}
          onClick={goToNext}
          title="Próximo menu"
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <span className="text-sm leading-none">▶</span>
        </button>
      </div>

      {/* Linha 2: metadados — direto se 1 bloco, colapsável se 2+ */}
      {resolvedBlocks.length > 0 && (
        <div className="w-full flex flex-col items-center">
          {!hasMultipleBlocks ? (
            <span
              className="text-[11.5px] text-zinc-500 text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
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
              <button
                onClick={() => setMetadataExpanded((prev) => !prev)}
                className="text-[11.5px] text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                {collapsedSummaryLabel}
                <span
                  className="text-[10px] transition-transform"
                  style={{ transform: metadataExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  ▾
                </span>
              </button>

              {metadataExpanded && (
                <div className="w-full flex flex-col gap-0.5 mt-1.5 px-2">
                  {resolvedBlocks.map((block, index) => (
                    <div
                      key={index}
                      className="flex items-baseline gap-1.5 text-[11.5px] text-zinc-600"
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
      )}
    </div>
  );
}