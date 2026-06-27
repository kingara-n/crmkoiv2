import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-50 flex items-center justify-center">
      {/* Clean Gradient Background matching logo colors (Red, White, Gray) */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/10 via-white to-neutral-200" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-neutral-200 via-transparent to-transparent" />

      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-black transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      {/* Content wrapper */}
      <div className="relative z-10 w-full px-4 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
