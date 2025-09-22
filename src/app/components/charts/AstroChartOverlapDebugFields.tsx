import React from "react";

interface AstroChartDebugProps {
  gap: number;
  onGap?: (val: number) => void;
  rowSize: number;
  onRowSize?: (val: number) => void;
  maxRowsBeforeDiagonal: number;
  onMaxRowsBeforeDiagonal?: (val: number) => void;
  rowInwardStep: number;
  onRowInwardStep?: (val: number) => void;
  perpSpacing: number;
  onPerpSpacing?: (val: number) => void;
  diagonalPerpStep: number;
  onDiagonalPerpStep?: (val: number) => void;
  diagonalInwardStep: number;
  onDiagonalInwardStep?: (val: number) => void;
}

export default function AstroChartOverlapDebugFields(
  props: AstroChartDebugProps
) {
  const {
    gap,
    onGap,
    rowSize,
    onRowSize,
    maxRowsBeforeDiagonal,
    onMaxRowsBeforeDiagonal,
    rowInwardStep,
    onRowInwardStep,
    perpSpacing,
    onPerpSpacing,
    diagonalPerpStep,
    onDiagonalPerpStep,
    diagonalInwardStep,
    onDiagonalInwardStep,
  } = props;

  return (
    <div className="w-full p-2 pl-24 flex flex-col items-center justify-center">
      <label className="w-full flex flex-row gap-2">
        <span className="w-[15rem]">Gap:</span>
        <input
          type="number"
          className="w-1/12 border-2 rounded-sm mb-1"
          value={gap}
          onChange={(e) => onGap?.(Number.parseFloat(e.target.value))}
        />
      </label>
      <label className="w-full flex flex-row gap-2">
        <span className="w-[15rem]">Row Size:</span>
        <input
          type="number"
          className="w-1/12 border-2 rounded-sm mb-1"
          value={rowSize}
          onChange={(e) => onRowSize?.(Number.parseFloat(e.target.value))}
        />
      </label>
      <label className="w-full flex flex-row gap-2">
        <span className="w-[15rem]">Max Rows Before Diagonal:</span>
        <input
          type="number"
          className="w-1/12 border-2 rounded-sm mb-1"
          value={maxRowsBeforeDiagonal}
          onChange={(e) =>
            onMaxRowsBeforeDiagonal?.(Number.parseFloat(e.target.value))
          }
        />
      </label>
      <label className="w-full flex flex-row gap-2">
        <span className="w-[15rem]">Row Inward Step:</span>
        <input
          type="number"
          className="w-1/12 border-2 rounded-sm mb-1"
          value={rowInwardStep}
          onChange={(e) => onRowInwardStep?.(Number.parseFloat(e.target.value))}
        />
      </label>
      <label className="w-full flex flex-row gap-2">
        <span className="w-[15rem]">Perp Spacing:</span>
        <input
          type="number"
          className="w-1/12 border-2 rounded-sm mb-1"
          value={perpSpacing}
          onChange={(e) => onPerpSpacing?.(Number.parseFloat(e.target.value))}
        />
      </label>
      <label className="w-full flex flex-row gap-2">
        <span className="w-[15rem]">Diagonal Perp Step:</span>
        <input
          type="number"
          className="w-1/12 border-2 rounded-sm mb-1"
          value={diagonalPerpStep}
          onChange={(e) =>
            onDiagonalPerpStep?.(Number.parseFloat(e.target.value))
          }
        />
      </label>
      <label className="w-full flex flex-row gap-2">
        <span className="w-[15rem]">Diagonal Inward Step:</span>
        <input
          type="number"
          className="w-1/12 border-2 rounded-sm mb-1"
          value={diagonalInwardStep}
          onChange={(e) =>
            onDiagonalInwardStep?.(Number.parseFloat(e.target.value))
          }
        />
      </label>
    </div>
  );
}
