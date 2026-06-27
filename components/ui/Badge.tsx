import { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-ink-800 text-neutral-300 border border-ink-700",
  success: "bg-accent-500/10 text-accent-400 border border-accent-500/20",
  warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  danger:  "bg-red-500/10 text-red-400 border border-red-500/20",
  info:    "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  accent:  "bg-accent-500/15 text-accent-300 border border-accent-500/30",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  icon?: ReactNode;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  );
}
