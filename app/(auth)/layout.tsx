import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505] flex items-center justify-center">
      {/* Moving Glassmorphic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Floating gradient blobs */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[100px] top-[10%] left-[5%] animate-blob-slow" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-accent-500/10 blur-[120px] bottom-[15%] right-[5%] animate-blob-slower" />
        <div className="absolute w-[450px] h-[450px] rounded-full bg-neutral-600/10 blur-[90px] top-[40%] right-[30%] animate-blob-slowest" />
      </div>

      {/* Grid overlay for texture */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,_black,_transparent_80%)]" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full px-4 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
