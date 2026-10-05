// src/app/components/forecast/Collapsible.tsx
"use client";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
// import { useClickOutside } from "@/app/hooks/useClickOutside";

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  floating?: boolean; // quando true, o painel abre por cima, sem empurrar o layout
}

export default function Collapsible({ title, children, defaultOpen = false, floating = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className={floating ? "relative w-full" : "w-full border border-zinc-200 rounded-lg overflow-hidden"} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex flex-row items-center justify-between px-3 py-2 text-sm text-zinc-700 bg-zinc-50 hover:bg-zinc-100 ${floating ? "rounded-lg border border-zinc-200" : ""}`}
      >
        <span>{title}</span>
        {open ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
      </button>

      {open && (
        floating ? (
          <div className="absolute z-20 top-full mt-1 left-0 w-full bg-white border border-zinc-200 rounded-lg shadow-lg p-3 flex flex-col gap-2">
            {children}
          </div>
        ) : (
          <div className="px-3 py-2 flex flex-col gap-2">{children}</div>
        )
      )}
    </div>
  );
}