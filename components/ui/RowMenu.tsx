"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

interface MenuItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  icon?: ReactNode;
}

export function RowMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="rounded p-1 text-neutral-400 hover:bg-ink-800 hover:text-white"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-ink-700 bg-ink-900 p-1 shadow-xl">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={(e) => { e.stopPropagation(); it.onClick(); setOpen(false); }}
              className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm hover:bg-ink-800 ${
                it.destructive ? "text-red-400" : "text-neutral-200"
              }`}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
