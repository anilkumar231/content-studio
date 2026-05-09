"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users,
  Newspaper,
  Film,
  Repeat2,
  Clapperboard,
  Upload,
  ImageIcon,
  Settings,
  FileText,
  Send,
  Zap,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniBar } from "@/components/dashboard/sparkline";
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

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-5 w-5 flex flex-col justify-center gap-1.5">
      <span
        className={cn(
          "block h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 origin-center",
          open && "translate-y-[5px] rotate-45"
        )}
      />
      <span
        className={cn(
          "block h-[1.5px] rounded-full bg-current transition-all duration-300",
          open ? "w-0 opacity-0" : "w-5 opacity-100"
        )}
      />
      <span
        className={cn(
          "block h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 origin-center",
          open && "-translate-y-[5px] -rotate-45"
        )}
      />
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [activeRun, setActiveRun] = useState(false);
  const [weekActivity, setWeekActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // Poll for active pipeline run
  useEffect(() => {
    async function check() {
      try {
        const { data } = await supabase
          .from("pipeline_runs")
          .select("id,started_at,status")
          .eq("status", "started")
          .limit(1);
        setActiveRun((data?.length ?? 0) > 0);

        // Build 7-day activity bar (last 7 days run counts)
        const days: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          const { count } = await supabase
            .from("pipeline_runs")
            .select("id", { count: "exact", head: true })
            .gte("started_at", key + "T00:00:00")
            .lte("started_at", key + "T23:59:59");
          days.push(count ?? 0);
        }
        setWeekActivity(days);
      } catch {
        // silently skip if Supabase not configured
      }
    }
    check();
    const t = setInterval(check, 20000);
    return () => clearInterval(t);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    if (dark) {
      html.classList.remove("dark");
      setDark(false);
    } else {
      html.classList.add("dark");
      setDark(true);
    }
  }

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 h-14 flex items-center px-4 glass-sidebar border-b border-white/[0.07]">
        <button
          className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors mr-3 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <HamburgerIcon open={open} />
        </button>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center glow-blue">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">Anilytix</span>
        </div>

        {activeRun && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-primary">
            <span
              className="h-2 w-2 rounded-full bg-primary"
              style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }}
            />
            Live
          </div>
        )}
      </header>

      {/* ── Mobile backdrop ─────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────── */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 ease-in-out",
          "glass-sidebar",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            {/* Logo icon with glow */}
            <div
              className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 glow-blue"
              style={{ animation: "float 4s ease-in-out infinite" }}
            >
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold tracking-tight shimmer-text">
                Anilytix
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                @Anilytix
              </p>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 mt-3">
            <span className="flex items-center gap-1.5 text-[10px] bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium border border-primary/15">
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary"
                style={
                  activeRun
                    ? { animation: "pulse-dot 1s ease-in-out infinite" }
                    : {}
                }
              />
              {activeRun ? "Pipeline running" : "AI & Technology"}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <p className="px-3 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {group.label}
              </p>

              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-xl animate-pulse-glow pointer-events-none" />
                    )}
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-all",
                        isActive
                          ? "text-primary"
                          : "group-hover:scale-110"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: 7-day activity chart + Settings */}
        <div className="p-3 border-t border-white/[0.07] space-y-3">
          {/* Mini activity chart */}
          <div className="px-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">
              7-Day Activity
            </p>
            <div className="flex items-end justify-between gap-0.5 h-8">
              {weekActivity.map((count, i) => {
                const days = ["S", "M", "T", "W", "T", "F", "S"];
                const today = new Date().getDay();
                const dayIdx = (today - 6 + i + 7) % 7;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: count > 0 ? Math.max(4, count * 8) : 2,
                        background:
                          count > 0
                            ? `oklch(0.607 0.207 264.376 / ${0.4 + count * 0.2})`
                            : "oklch(1 0 0 / 0.06)",
                        boxShadow:
                          count > 0
                            ? "0 0 6px oklch(0.607 0.207 264.376 / 0.4)"
                            : "none",
                      }}
                    />
                    <span className="text-[8px] text-muted-foreground/40">
                      {days[dayIdx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settings link */}
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 w-full",
              pathname === "/settings"
                ? "bg-primary/15 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
