export function Avatar({
  initials,
  size = "md",
  crown,
  rank,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  crown?: boolean;
  rank?: number;
}) {
  const sizes: Record<string, string> = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div className="relative inline-flex">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-black`}
        style={{
          background: "linear-gradient(135deg, #34d399 0%, #38bdf8 100%)",
        }}
      >
        {initials}
      </div>
      {crown && rank && (
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white border-2 border-ink-900">
          {rank}
        </div>
      )}
    </div>
  );
}
