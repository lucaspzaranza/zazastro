import React from "react";
import { SkeletonLine } from "./SkeletonLine";

export const SkeletonTable: React.FC<{ rows?: number; cols?: number, colsWidthArray?: string[] }> = ({
  rows = 6,
  cols = 3,
  colsWidthArray = ["w-24", "w-48", "w-32"]
}) => {
  return (
    <div role="status" className="animate-pulse space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          {[...Array(cols)].map((_, j) => (
            <SkeletonLine key={j} width={colsWidthArray[j % 3]} />
          ))}
        </div>
      ))}
      <span className="sr-only">Carregando...</span>
    </div>
  );
};
