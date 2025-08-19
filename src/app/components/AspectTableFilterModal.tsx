"use client";

import React from "react";

interface FilterModalProps {
  title: string;
  children: React.ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export default function AspectTableFilterModal({
  title,
  children,
  onCancel,
  onConfirm,
}: FilterModalProps) {
  return (
    <div className="absolute w-[200%] flex flex-col z-10 bg-white outline-2">
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
