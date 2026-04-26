import type { Metadata } from "next";
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
  title: `Content Studio - ${studio.creator.channelName}`,
  description: `Content creation dashboard for ${studio.creator.channelName}`,
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
  themeColor: "#0a0f1e",
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
        <PasswordGate>
          <Sidebar />
          <main className="flex-1 overflow-auto md:ml-0">
            {/* pt-14 = space below the fixed mobile header */}
            <div className="p-4 pt-[72px] md:pt-6 md:p-8 max-w-7xl mx-auto">{children}</div>
          </main>
        </PasswordGate>
      </body>
    </html>
  );
}
