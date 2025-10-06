import React from "react";

type SkeletonLineProps = {
  width?: string;
  height?: string;
  className?: string;
};

export const SkeletonLine: React.FC<SkeletonLineProps> = ({
  width = "w-full",
  height = "h-4",
  className = "",
}) => (
  <div
    className={`bg-gray-200 dark:bg-gray-700 rounded skeleton-shimmer ${width} ${height} ${className}`}
  />
);
