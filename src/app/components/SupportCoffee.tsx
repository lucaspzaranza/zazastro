"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { buildPixPayload } from "@/utils/pix";

const PRESET_AMOUNTS = [10, 20, 30, 50];

export default function SupportCoffee() {
  const t = useTranslations("support");
  const [amount, setAmount] = useState<number | undefined>(PRESET_AMOUNTS[0]);
  const [copied, setCopied] = useState(false);

  const payload = buildPixPayload({
    key: process.env.NEXT_PUBLIC_PIX_KEY!,
    name: "Lucas",          // use o nome que aparece na sua conta
    city: "Fortaleza",
    amount,
  });

  async function handleCopy() {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 text-slate-800">
      <h2 className="text-lg font-bold">{t("title")}</h2>
      <p className="text-center text-sm">{t("description")}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {PRESET_AMOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={amount === value}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${amount === value ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 hover:bg-slate-100"}`}
            onClick={() => setAmount(value)}
          >
            R$ {value}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={amount === undefined}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${amount === undefined ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 hover:bg-slate-100"}`}
          onClick={() => setAmount(undefined)}
        >{t("anyAmount")}</button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <QRCodeSVG value={payload} size={200} className="h-auto max-w-full" />
      </div>

      <button type="button" className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800" onClick={handleCopy}>
        {copied ? t("copied") : t("copyCode")}
      </button>
    </div>
  );
}
