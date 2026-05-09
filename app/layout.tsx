import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { PasswordGate } from "@/components/layout/password-gate";
import { studio } from "@/config/studio.config";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { themeColor: "#060b18" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      /* dark applied by default; theme script may remove it for light mode */
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs synchronously before paint — reads localStorage and removes
          the dark class if the user previously chose light mode.
          suppressHydrationWarning on <html> prevents React mismatch warning.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('anilytix-theme');if(t==='light')document.documentElement.classList.remove('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="h-full flex">
        {/* ── Animated liquid glass background ─── */}
        <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#060b18] via-[#080d1e] to-[#06091a]" />
          <div className="absolute rounded-full opacity-[0.28]"
            style={{ width:600, height:600, top:"-15%", left:"-10%",
              background:"radial-gradient(circle,#4F6AFF 0%,#3B52D4 40%,transparent 70%)",
              filter:"blur(72px)", animation:"orb-1 18s ease-in-out infinite" }} />
          <div className="absolute rounded-full opacity-[0.22]"
            style={{ width:700, height:700, bottom:"-20%", right:"-15%",
              background:"radial-gradient(circle,#7C3AED 0%,#5B21B6 40%,transparent 70%)",
              filter:"blur(80px)", animation:"orb-2 22s ease-in-out infinite" }} />
          <div className="absolute rounded-full opacity-[0.14]"
            style={{ width:400, height:400, top:"35%", right:"20%",
              background:"radial-gradient(circle,#0EA5E9 0%,#0369A1 40%,transparent 70%)",
              filter:"blur(60px)", animation:"orb-3 15s ease-in-out infinite" }} />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage:`linear-gradient(oklch(1 0 0/1) 1px,transparent 1px),linear-gradient(90deg,oklch(1 0 0/1) 1px,transparent 1px)`,
              backgroundSize:"48px 48px" }} />
        </div>

        <PasswordGate>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {/* pt-16 on mobile clears the fixed header (h-14 + 2px border) */}
            <div className="p-4 pt-16 md:pt-6 md:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </PasswordGate>
      </body>
    </html>
  );
}
