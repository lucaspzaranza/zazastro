"use client";

import React, { useState } from "react";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import Image from "next/image";
import { ResolvedChartDate } from "@/hooks/useResolvedChartDate";
import ChartHeaderSubtitle from "./ChartHeaderSubtitle";

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
  const { title, dateBlocks, genderIconPath, genderIconSize = 16 } = props;
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
    <div className="w-full flex flex-col gap-1 md:px-3">
      {/* Linha 1: navegação + título truncado */}
      <div className="w-full flex items-center justify-center gap-1.5">
        <button
          disabled={isFirstChart()}
          onClick={goToPrevious}
          title="Menu anterior"
          className="flex-shrink-0 md:px-4 md:w-6 h-min flex items-center justify-center rounded-md text-zinc-800 hover:bg-zinc-200 hover:text-zinc-700 active:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <span className="text-lg leading-none">◀</span>
        </button>

        <div className="flex-1 min-w-0 flex flex-row items-center justify-center gap-1.5 px-1">
          {typeof title === "string" ? (
            <span
              className="text-[16px] font-semibold text-zinc-800 whitespace-nowrap overflow-hidden text-ellipsis"
              title={title}
            >
              {title}
            </span>
          ) : (
            // Quando title é um ReactNode complexo (ex: com símbolo embutido),
            // não há texto puro para o atributo `title` nativo de tooltip —
            // o truncamento ainda se aplica visualmente, mas sem fallback de
            // texto completo no hover nesse caso específico.
            <span className="text-[16px] font-semibold text-zinc-800 whitespace-nowrap overflow-hidden text-ellipsis flex flex-row items-center justify-center gap-1">
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
          className="flex-shrink-0 md:px-4 md:w-6 h-min flex items-center justify-center rounded-md text-zinc-800 hover:bg-zinc-200 hover:text-zinc-700 active:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <span className="text-lg leading-none">▶</span>
        </button>
      </div>

      <ChartHeaderSubtitle blocks={resolvedBlocks}/>
    </div>
  );
}