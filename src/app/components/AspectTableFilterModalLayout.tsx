"use client";

import React from "react";

interface FilterModalProps {
  title: string;
  isVisible: boolean;
  children: React.ReactNode;
  widthClass?: string;
  heightClass?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export default function AspectTableFilterModalLayout({
  title,
  isVisible,
  children,
  widthClass,
  heightClass,
  onCancel,
  onConfirm,
}: FilterModalProps) {
  const containerClasses = `absolute flex flex-col z-10 bg-white outline-2 ${
    widthClass ?? "w-[200px]"
  } ${heightClass ?? ""} ${isVisible ? "block" : "hidden"}`;

  return (
    <div className={containerClasses}>
      <span className=" border-b-2 p-1">{title}</span>
      {children}
      <div className="flex flex-row items-center justify-around mb-1">
        <button
          className="border-2 px-1 hover:bg-gray-200 active:bg-gray-300"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="border-2 px-1 hover:bg-gray-200 active:bg-gray-300"
          onClick={onConfirm}
        >
          Filtrar
        </button>
      </div>
    </div>
  );
}
