// src/app/components/forecast/ChipToggle.tsx
"use client";

  const pillBase =
    "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium whitespace-nowrap transition-colors disabled:opacity-50";
  const pillInactive =
    `${pillBase} border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50`;
  const pillActive =
    `${pillBase} border-blue-300 bg-blue-50 text-blue-800`;

interface ChipToggleProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function ChipToggle({ active, onClick, children, title }: ChipToggleProps) {
  return (
    <button type="button" title={title} onClick={onClick} className={active ? pillActive : pillInactive}>
      {children}
    </button>
  );
}