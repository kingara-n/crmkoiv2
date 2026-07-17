import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-50 flex items-center justify-center">
      {/* Moving Glassmorphic Background - Bright and Colorful */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Soft, beautiful, colorful mesh gradients */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-red-500/10 blur-[100px] top-[-10%] left-[-15%] orb-1" />
        <div className="absolute w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[120px] bottom-[-10%] right-[-15%] orb-2" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-neutral-300/40 blur-[90px] top-[30%] left-[30%] orb-3" />
      </div>

      {/* Grid overlay for texture */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(0,0,0,0.015)_1px,_transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,_black,_transparent_80%)]" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full px-4 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
