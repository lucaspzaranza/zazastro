"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ResolvedChartDate } from "@/hooks/useResolvedChartDate";
import ChartHeaderSubtitle from "./ChartHeaderSubtitle";

interface ChartHeaderProps {
  title?: React.ReactNode;
  dateBlocks: ResolvedChartDate[];
  genderIconPath?: string;
  genderIconSize?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}

export default function ChartHeader(props: ChartHeaderProps) {
  const {
    title, dateBlocks, genderIconPath, genderIconSize = 16,
    onPrevious, onNext, previousDisabled = false, nextDisabled = false,
  } = props;
  const [metadataExpanded, setMetadataExpanded] = useState(false);

  const resolvedBlocks = dateBlocks.filter((b): b is ResolvedChartDate => b !== undefined);

  return (
    <div className="w-full flex flex-col gap-1 md:px-3">
      <div className="w-full flex items-center justify-center gap-1.5">
        {onPrevious ? (
          <button
            disabled={previousDisabled}
            onClick={onPrevious}
            title="Menu anterior"
            className="md:absolute py-3 left-1 md:left-2 flex-shrink-0 md:px-4 md:w-6 h-min flex items-center justify-center rounded-md text-zinc-800 hover:bg-zinc-200 hover:text-zinc-700 active:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="text-lg leading-none">◀</span>
          </button>
        ) : <div className="md:absolute left-1 md:left-2 w-0 md:w-6" />}

        <div className="flex-1 min-w-0 flex flex-row items-center justify-center gap-1.5 px-1">
          {typeof title === "string" ? (
            <span className="text-[16px] font-semibold text-zinc-800 whitespace-nowrap overflow-hidden text-ellipsis" title={title}>
              {title}
            </span>
          ) : (
            <span className="text-[16px] font-semibold text-zinc-800 whitespace-nowrap overflow-hidden text-ellipsis flex flex-row items-center justify-center gap-1">
              {title}
            </span>
          )}

          {genderIconPath && (
            <Image src={genderIconPath} width={genderIconSize} height={genderIconSize} alt="genderIcon" unoptimized priority className="flex-shrink-0" />
          )}
        </div>

        {onNext ? (
          <button
            disabled={nextDisabled}
            onClick={onNext}
            title="Próximo menu"
            className="md:absolute py-3 right-1 md:right-2 flex-shrink-0 md:px-4 md:w-6 h-min flex items-center justify-center rounded-md text-zinc-800 hover:bg-zinc-200 hover:text-zinc-700 active:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="text-lg leading-none">▶</span>
          </button>
        ) : <div className="md:absolute right-1 md:right-2 w-0 md:w-6" />}
      </div>

      <ChartHeaderSubtitle blocks={resolvedBlocks}/>
    </div>
  );
}