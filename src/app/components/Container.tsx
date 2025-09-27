import React from "react";

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        className +
        " flex flex-col items-center justify-center sm:p-8 rounded-2xl bg-white/70 shadow-[0_0_50px_rgba(0,0,0,0.12)] sm:shadow-lg"
      }
    >
      {children}
    </div>
  );
}
