"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Calendar, BarChart3, Users, Newspaper,
  Film, Repeat2, Clapperboard, Upload, ImageIcon, Settings,
  FileText, Send, Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const navGroups = [
  {
    label: "Pipeline",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/video", label: "Video Creation", icon: Clapperboard },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/thumbnails", label: "Thumbnails", icon: ImageIcon },
      { href: "/scripts", label: "Scripts", icon: FileText },
      { href: "/repurpose", label: "Repurpose", icon: Repeat2 },
      { href: "/shorts", label: "Shorts", icon: Film },
      { href: "/publishing", label: "Publishing", icon: Upload },
      { href: "/publish", label: "Social Posts", icon: Send },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/news", label: "AI News", icon: Newspaper },
      { href: "/peers", label: "Peers", icon: Users },
    ],
  },
];

/* ── Animated hamburger → X ──────────────────────────────────── */
function Hamburger({ open }: { open: boolean }) {
  return (
    <div className="relative w-5 h-5 flex flex-col justify-center gap-[5px]">
      <span className={cn("block h-[1.5px] rounded-full bg-current transition-all duration-300 origin-center",
        open ? "w-5 translate-y-[6.5px] rotate-45" : "w-5")} />
      <span className={cn("block h-[1.5px] rounded-full bg-current transition-all duration-200",
        open ? "w-0 opacity-0" : "w-5 opacity-100")} />
      <span className={cn("block h-[1.5px] rounded-full bg-current transition-all duration-300 origin-center",
        open ? "w-5 -translate-y-[6.5px] -rotate-45" : "w-5")} />
    </div>
  );
}

/* ── Inline SVG logo ─────────────────────────────────────────── */
function AnilytixLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sl" x1="12" y1="88" x2="92" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#00D4FF"/>
          <stop offset="55%"  stopColor="#00A8CC"/>
          <stop offset="100%" stopColor="#0055CC"/>
        </linearGradient>
        <linearGradient id="sa" x1="74" y1="70" x2="95" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#00CCEE"/>
          <stop offset="100%" stopColor="#00EEFF"/>
        </linearGradient>
      </defs>
      <line x1="12" y1="88" x2="50" y2="14" stroke="url(#sl)" strokeWidth="10" strokeLinecap="round"/>
      <line x1="50" y1="14" x2="74" y2="72" stroke="url(#sl)" strokeWidth="10" strokeLinecap="round"/>
      <line x1="27" y1="57" x2="67" y2="57" stroke="url(#sl)" strokeWidth="8"  strokeLinecap="round"/>
      <circle cx="16" cy="81" r="3.2" fill="#00A8CC"/>
      <line x1="16" y1="81" x2="30" y2="81" stroke="#0A1A2F" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="30" cy="81" r="3"   fill="#0A1A2F" stroke="#0099BB" strokeWidth="1.5"/>
      <circle cx="22" cy="68" r="2.8" fill="#00A8CC"/>
      <line x1="22" y1="68" x2="35" y2="68" stroke="#0A1A2F" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="35" cy="68" r="2.6" fill="#0A1A2F" stroke="#0088AA" strokeWidth="1.5"/>
      <circle cx="30" cy="53" r="2.2" fill="#0099BB"/>
      <line x1="30" y1="53" x2="41" y2="53" stroke="#0A1A2F" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="41" cy="53" r="2"   fill="#0A1A2F" stroke="#0077AA" strokeWidth="1.2"/>
      <circle cx="38" cy="37" r="1.8" fill="#0099BB"/>
      <line x1="38" y1="37" x2="47" y2="37" stroke="#0A1A2F" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="47" cy="37" r="1.6" fill="#0A1A2F" stroke="#0077AA" strokeWidth="1"/>
      <line x1="74" y1="70" x2="93" y2="20" stroke="url(#sa)" strokeWidth="8" strokeLinecap="round"/>
      <polyline points="82,24 93,16 98,28" stroke="#00E5FF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [activeRun, setActiveRun] = useState(false);
  const [weekActivity, setWeekActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  /* Sync dark state with actual DOM on mount */
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  /* Poll pipeline + build 7-day activity */
  useEffect(() => {
    async function check() {
      try {
        const { data } = await supabase
          .from("pipeline_runs").select("id,status,started_at")
          .eq("status", "started").limit(1);
        setActiveRun((data?.length ?? 0) > 0);

        const days: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          const { count } = await supabase
            .from("pipeline_runs").select("id", { count: "exact", head: true })
            .gte("started_at", key + "T00:00:00")
            .lte("started_at", key + "T23:59:59");
          days.push(count ?? 0);
        }
        setWeekActivity(days);
      } catch { /* Supabase not configured — silent */ }
    }
    check();
    const t = setInterval(check, 20000);
    return () => clearInterval(t);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    const next = !dark;
    if (next) {
      html.classList.add("dark");
      localStorage.setItem("anilytix-theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("anilytix-theme", "light");
    }
    setDark(next);
  }

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 h-14 flex items-center gap-3 px-4"
        style={{ background: "rgba(6,11,24,0.85)", backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <button className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-foreground"
          onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <Hamburger open={open} />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AnilytixLogo size={26} />
          <span className="text-sm font-bold tracking-tight shimmer-text">Anilytix</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeRun && (
            <span className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
              <span className="h-2 w-2 rounded-full bg-primary"
                style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }} />
              Live
            </span>
          )}
          <button onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── Mobile backdrop ─────────────────────────────────── */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ background: "rgba(6,11,24,0.88)", backdropFilter: "blur(48px) saturate(180%)",
          WebkitBackdropFilter: "blur(48px) saturate(180%)", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div style={{ animation: "float 4s ease-in-out infinite" }}>
              <AnilytixLogo size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold tracking-tight shimmer-text">Anilytix</h1>
              <p className="text-[11px] text-muted-foreground">@Anilytix</p>
            </div>
            <button onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Toggle theme">
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="flex items-center gap-1.5 text-[10px] bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium border border-primary/15">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"
                style={activeRun ? { animation: "pulse-dot 1s ease-in-out infinite" } : {}} />
              {activeRun ? "Pipeline running" : "AI & Technology"}
            </span>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <p className="px-3 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    )}>
                    {isActive && <span className="absolute inset-0 rounded-xl animate-pulse-glow pointer-events-none" />}
                    <item.icon className={cn("h-4 w-4 shrink-0 transition-all", isActive ? "text-primary" : "group-hover:scale-110")} />
                    <span className="truncate">{item.label}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 7-day activity + Settings */}
        <div className="p-3 border-t border-white/[0.07] space-y-3">
          <div className="px-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">
              7-Day Activity
            </p>
            <div className="flex items-end gap-0.5 h-8">
              {weekActivity.map((count, i) => {
                const labels = ["S","M","T","W","T","F","S"];
                const todayIdx = new Date().getDay();
                const dayIdx = (todayIdx - 6 + i + 7) % 7;
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                    <div className="w-full rounded-sm transition-all"
                      style={{
                        height: count > 0 ? Math.max(4, count * 8) : 2,
                        background: count > 0 ? `oklch(0.607 0.207 264.376 / ${Math.min(1, 0.4 + count * 0.25)})` : "oklch(1 0 0 / 0.06)",
                        boxShadow: count > 0 ? "0 0 6px oklch(0.607 0.207 264.376 / 0.4)" : "none",
                      }} />
                    <span className="text-[8px] text-muted-foreground/40">{labels[dayIdx]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Link href="/settings" onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full",
              pathname === "/settings"
                ? "bg-primary/15 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
            )}>
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
