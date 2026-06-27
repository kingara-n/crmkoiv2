import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ink-950 flex items-center justify-center">
      {/* Graceful Fallback Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-ink-950 via-[#0a1128] to-ink-950" />
      
      {/* Video Background (if present, overlays the gradient) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-60 mix-blend-screen"
        poster="/videos/auth-background-poster.jpg"
      >
        <source src="/videos/auth-background.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-black/40" />

      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
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
