"use client";

import { FilterModalProps } from "@/interfaces/AspectTableInterfaces";
import { useTranslations } from "next-intl";
import React from "react";

export default function AspectTableFilterModalLayout({
  title,
  isVisible,
  children,
  className,
  onCancel,
  onConfirm,
}: FilterModalProps) {
  const classes = `absolute rounded-lg border-zinc-400 p-0! flex flex-col z-10 bg-white outline ${
    isVisible ? "block" : "hidden"
  } ${className}`;

  const t = useTranslations();

  return (
    <div className={classes}>
      <span className="border-b p-1">{title}</span>
      {children}
      <div className="flex flex-row items-center justify-around mb-1">
        <button
          className="default-input-field p-1! hover:bg-gray-200 active:bg-gray-300"
          onClick={() => onCancel?.()}
        >
          {t("aspects.cancel")}
        </button>
        <button
          className="default-input-field p-1! hover:bg-gray-200 active:bg-gray-300"
          onClick={() => onConfirm?.()}
        >
          {t("aspects.filter")}
        </button>
      </div>
    </div>
  );
}
