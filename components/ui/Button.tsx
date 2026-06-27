"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent-500 hover:bg-accent-400 text-black font-medium",
  secondary:
    "bg-ink-800 hover:bg-ink-700 text-white border border-ink-700",
  ghost:
    "bg-transparent hover:bg-ink-800 text-neutral-200",
  danger:
    "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30",
};

export function Button({
  variant = "primary",
  icon,
  fullWidth,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
