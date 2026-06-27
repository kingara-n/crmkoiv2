export function ProgressBar({
  value, // 0..100
  tone = "accent",
  className = "",
}: {
  value: number;
  tone?: "accent" | "amber" | "blue" | "red";
  className?: string;
}) {
  const tones: Record<string, string> = {
    accent: "bg-accent-500",
    amber: "bg-amber-500",
    blue: "bg-sky-500",
    red: "bg-red-500",
  };
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full rounded-full bg-ink-800 overflow-hidden ${className}`}>
      <div
        className={`h-full ${tones[tone]} transition-all duration-300`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
