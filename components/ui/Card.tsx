import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={`rounded-card bg-ink-900 border border-ink-700/60 shadow-card ${padding ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon?: ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <p className="text-sm text-neutral-400">{label}</p>
        {icon && (
          <div className="text-neutral-500">{icon}</div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-3">
        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
        {delta && (
          <span className={`text-xs font-medium ${delta.positive ? "text-accent-400" : "text-chart-red"}`}>
            {delta.positive ? "↗" : "↘"} {delta.value}
          </span>
        )}
      </div>
    </Card>
  );
}
