"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setLocale } from "../actions/setLocale";
import ReactCountryFlag from "react-country-flag";

const LOCALES = [
  {
    code: "pt",
    label: "PT",
    countryCode: "BR",
  },
  {
    code: "en",
    label: "EN",
    countryCode: "US",
  },
  {
    code: "es",
    label: "ES",
    countryCode: "ES",
  },
];

interface LanguageSwitcherProps {
  current: string;
}

export default function LanguageSwitcher({
  current,
}: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const currentLocale =
    LOCALES.find((locale) => locale.code === current) ?? LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLocaleChange = (code: string) => {
    startTransition(async () => {
      await setLocale(code);
      setIsOpen(false);
    });
  };

  return (
    <div ref={menuRef}>
      {/* Desktop */}
      <div className="hidden sm:flex gap-1">
        {LOCALES.map(({ code, label, countryCode }) => (
          <button
            key={code}
            onClick={() => handleLocaleChange(code)}
            disabled={isPending}
            title={label}
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-all
              ${
                current === code
                  ? "bg-white/60 font-semibold shadow-sm"
                  : "opacity-50 hover:opacity-100"
              }`}
          >
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{
                width: "1.8em",
                height: "1.8em",
              }}
              title={countryCode}
            />

            <span className="hidden md:inline text-xs">{label}</span>
          </button>
        ))}
      </div>

      {/* Mobile */}
      <div className="relative sm:hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isPending}
          aria-label="Selecionar idioma"
          className="flex items-center justify-center rounded-md bg-white/70 p-1 shadow-sm"
        >
          <ReactCountryFlag
            countryCode={currentLocale.countryCode}
            svg
            style={{
              width: "1.8em",
              height: "1.8em",
            }}
            title={currentLocale.countryCode}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 z-50 min-w-[120px] overflow-hidden rounded-lg border bg-white shadow-lg">
            {LOCALES.map(({ code, label, countryCode }) => (
              <button
                key={code}
                onClick={() => handleLocaleChange(code)}
                disabled={isPending}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-slate-100
                  ${current === code ? "bg-slate-50 font-semibold" : ""}
                `}
              >
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{
                    width: "1.4em",
                    height: "1.4em",
                  }}
                  title={countryCode}
                />

                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}