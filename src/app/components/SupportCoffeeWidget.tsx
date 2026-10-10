"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MdAttachMoney } from "react-icons/md";
import SupportCoffee from "./SupportCoffee";

export default function SupportCoffeeWidget() {
  const t = useTranslations("support");
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-[70] flex flex-col items-end gap-3 sm:right-6">
      {open && (
        <section
          aria-label={t("title")}
          className="max-h-[min(75dvh,42rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="sticky top-0 flex justify-end border-b border-slate-100 bg-white/95 p-2 backdrop-blur">
            <button
              type="button"
              aria-label={t("close")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-600 hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <SupportCoffee />
        </section>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? t("close") : t("open")}
        className="flex size-11 items-center justify-center rounded-full border border-blue-200 bg-white p-0 text-sm font-semibold text-slate-700 shadow-lg transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:size-auto sm:min-h-12 sm:gap-1.5 sm:px-5"
        onClick={() => setOpen((current) => !current)}
      >
        <MdAttachMoney className="text-emerald-600" size={22} aria-hidden="true" />
        <span className="hidden sm:inline">{t("open")}</span>
      </button>
    </div>
  );
}
