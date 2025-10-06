import React from "react";
import { SkeletonLine } from "./SkeletonLine";

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 6,
  cols = 3,
}) => {
  return (
    <div role="status" className="animate-pulse space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          {[...Array(cols)].map((_, j) => (
            <SkeletonLine key={j} width={["w-24", "w-48", "w-32"][j % 3]} />
          ))}
        </div>
      ))}
      <span className="sr-only">Carregando...</span>
    </div>
  );
};
