// src/app/components/forecast/FilterDropdown.tsx
"use client";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
// import { useClickOutside } from "@/app/hooks/useClickOutside";

const pillBase =
  "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium whitespace-nowrap transition-colors disabled:opacity-50";
const pillInactive =
  `${pillBase} border-zinc-400 bg-white text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50`;
const pillActive =
  `${pillBase} border-blue-500 bg-blue-100 text-blue-800`;

interface FilterDropdownProps {
  label: string;
  children: React.ReactNode;
}

export default function FilterDropdown({ label, children }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className={open ? pillActive : pillInactive}>
        {label}
        {open ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1 left-1/2 -translate-x-1/2 w-72 bg-white border border-zinc-200 rounded-lg shadow-lg p-3 flex flex-col items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}