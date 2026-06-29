import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Koi Travel CRM",
  description: "Internal operations system for Koi Travel Limited",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Inter loaded at runtime so the build doesn't depend on Google Fonts. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-sans bg-ink-950 text-white antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
