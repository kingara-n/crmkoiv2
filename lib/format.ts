import { Currency } from "./types";

// Exchange rates relative to KES. In production these come from
// the `exchange_rates` table (set monthly by Accounts, per the PRD).
// For demo mode we hard-code reasonable mid-2026 rates.
export const RATES_TO_KES: Record<Currency, number> = {
  KES: 1,
  USD: 129,
  EUR: 140,
  GBP: 164,
  CAD: 95,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  KES: "KSh",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
};

export function convert(amountKes: number, target: Currency): number {
  if (target === "KES") return amountKes;
  return amountKes / RATES_TO_KES[target];
}

export function formatMoney(amountKes: number, target: Currency = "KES"): string {
  const safeAmount = amountKes || 0;
  const value = convert(safeAmount, target);
  const symbol = CURRENCY_SYMBOLS[target];

  if (Math.abs(value) >= 1_000_000) {
    return `${symbol} ${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${symbol} ${(value / 1_000).toFixed(1)}k`;
  }
  return `${symbol} ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatMoneyFull(amountKes: number, target: Currency = "KES"): string {
  const safeAmount = amountKes || 0;
  const value = convert(safeAmount, target);
  const symbol = CURRENCY_SYMBOLS[target];
  return `${symbol} ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
