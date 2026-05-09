"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Menu,
  X,
  Settings,
  FileText,
  Send,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const pipelineNav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/video", label: "Video Creation", icon: Clapperboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const contentNav = [
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/thumbnails", label: "Thumbnails", icon: ImageIcon },
  { href: "/scripts", label: "Scripts", icon: FileText },
  { href: "/repurpose", label: "Repurpose", icon: Repeat2 },
  { href: "/shorts", label: "Shorts", icon: Film },
  { href: "/publishing", label: "Publishing", icon: Upload },
  { href: "/publish", label: "Social Posts", icon: Send },
];

const intelNav = [
  { href: "/news", label: "AI News", icon: Newspaper },
  { href: "/peers", label: "Peers", icon: Users },
];

function NavSection({
  label,
  items,
  pathname,
  onClose,
}: {
  label: string;
  items: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </p>
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon
              className={cn("h-4 w-4 shrink-0", isActive && "text-primary")}
            />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 h-14 flex items-center px-4 bg-sidebar border-b border-sidebar-border">
        <button
          className="p-2 rounded-md hover:bg-accent transition-colors mr-3"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight">Anilytix</span>
        </div>
      </header>

      {/* ── Mobile overlay ─────────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-60 border-r border-sidebar-border bg-sidebar flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">
                Anilytix
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                @Anilytix
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              AI &amp; Tech
            </span>
            <span className="text-[10px] text-muted-foreground/60">Hinglish</span>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          <NavSection
            label="Pipeline"
            items={pipelineNav}
            pathname={pathname}
            onClose={() => setOpen(false)}
          />
          <NavSection
            label="Content"
            items={contentNav}
            pathname={pathname}
            onClose={() => setOpen(false)}
          />
          <NavSection
            label="Intelligence"
            items={intelNav}
            pathname={pathname}
            onClose={() => setOpen(false)}
          />
        </nav>

        {/* Settings footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full",
              pathname === "/settings"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
