import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { PasswordGate } from "@/components/layout/password-gate";
import { studio } from "@/config/studio.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${studio.creator.channelName} Studio`,
  description: `AI-powered content pipeline for ${studio.creator.channelName}`,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: `${studio.creator.channelName} Studio`,
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#060b18",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full flex">
        {/* ── Animated liquid glass background ─────────────────── */}
        <div
          aria-hidden
          className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        >
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#060b18] via-[#080d1e] to-[#06091a]" />

          {/* Orb 1 — blue, top-left */}
          <div
            className="absolute rounded-full opacity-[0.28]"
            style={{
              width: 600,
              height: 600,
              top: "-15%",
              left: "-10%",
              background:
                "radial-gradient(circle, #4F6AFF 0%, #3B52D4 40%, transparent 70%)",
              filter: "blur(72px)",
              animation: "orb-1 18s ease-in-out infinite",
            }}
          />

          {/* Orb 2 — violet, bottom-right */}
          <div
            className="absolute rounded-full opacity-[0.22]"
            style={{
              width: 700,
              height: 700,
              bottom: "-20%",
              right: "-15%",
              background:
                "radial-gradient(circle, #7C3AED 0%, #5B21B6 40%, transparent 70%)",
              filter: "blur(80px)",
              animation: "orb-2 22s ease-in-out infinite",
            }}
          />

          {/* Orb 3 — cyan, center-right */}
          <div
            className="absolute rounded-full opacity-[0.14]"
            style={{
              width: 400,
              height: 400,
              top: "35%",
              right: "20%",
              background:
                "radial-gradient(circle, #0EA5E9 0%, #0369A1 40%, transparent 70%)",
              filter: "blur(60px)",
              animation: "orb-3 15s ease-in-out infinite",
            }}
          />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `
                linear-gradient(oklch(1 0 0 / 1) 1px, transparent 1px),
                linear-gradient(90deg, oklch(1 0 0 / 1) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Noise texture for depth */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "200px 200px",
            }}
          />
        </div>

        <PasswordGate>
          <Sidebar />
          <main className="flex-1 overflow-auto md:ml-0">
            <div className="p-4 pt-[72px] md:pt-6 md:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </PasswordGate>
      </body>
    </html>
  );
}
