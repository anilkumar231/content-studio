"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkline } from "@/components/dashboard/sparkline";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { LiveAutomationFlow } from "@/components/dashboard/automation-flow";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Play,
  Users,
  Eye,
  Zap,
  TrendingUp,
  Clapperboard,
  Calendar,
  Repeat2,
  Newspaper,
  ArrowUpRight,
  Clock,
  BarChart2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ── Types ──────────────────────────────────────────────────── */
interface PipelineRun {
  id: string;
  topic: string;
  status: string;
  title: string | null;
  video_id: string | null;
  test_mode: boolean;
  started_at: string;
  completed_at: string | null;
}

interface YouTubeVideo {
  title: string;
  views: number;
  likes: number;
  publishedAt: string;
}

interface ChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

/* ── Animated counter hook ──────────────────────────────────── */
function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3); // cubic ease-out
      setVal(Math.round(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

/* ── Helpers ────────────────────────────────────────────────── */
function elapsed(started: string, completed: string | null) {
  const end = completed ? new Date(completed) : new Date();
  const s = Math.floor((end.getTime() - new Date(started).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, spark, color, delay = 0,
}: {
  label: string; value: number; sub: string;
  icon: React.ElementType; spark: number[]; color: string; delay?: number;
}) {
  const count = useCounter(value, 1200 + delay);
  return (
    <div
      className="relative glass rounded-2xl p-5 overflow-hidden group hover:glow-blue transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {/* Gradient blob in corner */}
      <div
        className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 transition-opacity group-hover:opacity-30"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}22`, border: `1px solid ${color}33` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="opacity-70">
          <Sparkline data={spark} color={color} height={32} width={72} />
        </div>
      </div>

      <p className="text-2xl font-bold tracking-tight tabular-nums">
        {fmtNum(count)}
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
    </div>
  );
}

/* ── Pipeline status icons ──────────────────────────────────── */
function RunIcon({ status }: { status: string }) {
  if (status === "completed")
    return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
  if (status === "failed")
    return <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
  return (
    <Loader2 className="h-4 w-4 text-primary shrink-0 animate-spin" />
  );
}

function RunBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    failed: "bg-red-400/10 text-red-400 border-red-400/20",
    started: "bg-primary/10 text-primary border-primary/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {status}
    </span>
  );
}

/* ── Competitor comparison matrix ───────────────────────────── */
const COMPETITORS = [
  { name: "Anilytix", handle: "@Anilytix", subs: "Growing", avgViews: 12000, uploads: 3, aiScore: 98, isOwn: true },
  { name: "Technical Guruji", handle: "@TechnicalGuruji", subs: "23M", avgViews: 900000, uploads: 6, aiScore: 62 },
  { name: "Gaurav Thakkar", handle: "@GauravThakkar", subs: "1.5M", avgViews: 80000, uploads: 4, aiScore: 71 },
  { name: "AI Wallah", handle: "@AIWallah", subs: "800K", avgViews: 45000, uploads: 5, aiScore: 85 },
  { name: "College Wallah", handle: "@CollegeWallah", subs: "4M", avgViews: 220000, uploads: 8, aiScore: 40 },
];

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
        {value}
      </span>
    </div>
  );
}

/* ── Quick action card ──────────────────────────────────────── */
function ActionCard({
  href, icon: Icon, label, desc, color, delay = 0,
}: {
  href: string; icon: React.ElementType;
  label: string; desc: string; color: string; delay?: number;
}) {
  return (
    <a
      href={href}
      className="relative glass rounded-2xl p-4 flex items-center gap-3 group hover:glow-blue transition-all duration-300 animate-fade-up overflow-hidden"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 0% 50%, ${color}15 0%, transparent 60%)`,
        }}
      />
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{ background: `${color}18`, border: `1px solid ${color}28` }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
      </div>
      <ArrowUpRight
        className="h-4 w-4 text-muted-foreground/40 shrink-0 transition-all duration-200 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  );
}

/* ── Section header ─────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
        {children}
      </p>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function OverviewPage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [runsRes, ytRes] = await Promise.all([
        supabase
          .from("pipeline_runs")
          .select("id,topic,status,title,video_id,test_mode,started_at,completed_at")
          .order("started_at", { ascending: false })
          .limit(10),
        fetch("/api/youtube").then((r) => r.json()).catch(() => null),
      ]);
      setRuns(runsRes.data || []);
      if (ytRes) {
        setVideos(ytRes.videos || []);
        setChannelStats(ytRes.channel || null);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(() => {
      if (runs.some((r) => r.status === "started")) fetchData();
    }, 15000);
    return () => clearInterval(t);
  }, [fetchData, runs]);

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const activeRun = runs.find((r) => r.status === "started");

  // Spark data: last 7 days views (using videos array or fallback)
  const viewsSpark = videos.length > 0
    ? videos.slice(0, 7).reverse().map((v) => v.views)
    : [12000, 18000, 15000, 22000, 19000, 28000, 24000];
  const subSpark = [100, 120, 140, 130, 160, 155, 180];
  const runSpark = [0, 1, 0, 2, 1, 0, completedRuns];
  const videoSpark = [40, 41, 42, 43, 44, 45, channelStats?.videoCount ?? 45];

  const activeDates = runs.map((r) => r.started_at);

  return (
    <div className="space-y-10 pb-8">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="animate-fade-up"
        style={{ animationFillMode: "both" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-widest mb-1">
              Anilytix Studio
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {greeting}, Anil{" "}
              <span
                className="inline-block"
                style={{ animation: "float 3s ease-in-out infinite" }}
              >
                ✦
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              AI &amp; Technology &bull; Content creator &bull;{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Live pipeline pill */}
          {activeRun && (
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 animate-pulse-glow border border-primary/20">
              <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary">Pipeline running</p>
                <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                  {activeRun.topic}
                </p>
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                {elapsed(activeRun.started_at, null)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Automation Flow ──────────────────────────────────── */}
      <div className="animate-fade-up delay-100 glass rounded-2xl p-5" style={{ animationFillMode: "both" }}>
        <SectionLabel>AI Pipeline — Live Status</SectionLabel>
        <LiveAutomationFlow />
      </div>

      {/* ── Stats grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Subscribers" value={channelStats?.subscriberCount ?? 0}
          sub="YouTube channel" icon={Users}
          spark={subSpark} color="#4F6AFF" delay={0}
        />
        <StatCard
          label="Total Views" value={channelStats?.viewCount ?? 0}
          sub="all time" icon={Eye}
          spark={viewsSpark} color="#06B6D4" delay={80}
        />
        <StatCard
          label="Pipeline Runs" value={completedRuns}
          sub="completed successfully" icon={Zap}
          spark={runSpark} color="#A855F7" delay={160}
        />
        <StatCard
          label="Videos Published" value={channelStats?.videoCount ?? 0}
          sub="on channel" icon={TrendingUp}
          spark={videoSpark} color="#10B981" delay={240}
        />
      </div>

      {/* ── Pipeline + Actions ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pipeline runs table */}
        <div className="lg:col-span-2 animate-fade-up delay-300" style={{ animationFillMode: "both" }}>
          <SectionLabel>Pipeline Runs</SectionLabel>
          <div className="glass rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading runs…
              </div>
            ) : runs.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div
                  className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 animate-float"
                >
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No pipeline runs yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Run{" "}
                  <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-primary text-[11px]">
                    python main.py
                  </code>{" "}
                  to start
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {runs.slice(0, 8).map((run, i) => (
                  <div
                    key={run.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors animate-slide-left"
                    style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                  >
                    <RunIcon status={run.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-snug">
                        {run.title || run.topic}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <RunBadge status={run.status} />
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {elapsed(run.started_at, run.completed_at)}
                        </span>
                        <span className="text-[11px] text-muted-foreground/50">
                          {timeAgo(run.started_at)}
                        </span>
                        {run.test_mode && (
                          <span className="text-[10px] italic text-muted-foreground/40">test</span>
                        )}
                      </div>
                    </div>
                    {run.video_id ? (
                      <a
                        href={`https://youtube.com/watch?v=${run.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 rounded-lg px-2.5 py-1 border border-primary/15"
                      >
                        <Play className="h-3 w-3" />
                        Watch
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <div className="w-16 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3 animate-fade-up delay-400" style={{ animationFillMode: "both" }}>
          <SectionLabel>Quick Actions</SectionLabel>
          <ActionCard href="/video"     icon={Clapperboard} label="Create Video"    desc="Research → Script → Publish" color="#4F6AFF" delay={0} />
          <ActionCard href="/calendar"  icon={Calendar}     label="Schedule"        desc="Plan your content calendar"  color="#A855F7" delay={80} />
          <ActionCard href="/repurpose" icon={Repeat2}      label="Repurpose"       desc="YouTube → LinkedIn, X, Instagram" color="#06B6D4" delay={160} />
          <ActionCard href="/news"      icon={Newspaper}    label="AI News"         desc="Daily AI digest + video ideas"    color="#10B981" delay={240} />
        </div>
      </div>

      {/* ── Activity heatmap + Comparison matrix ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Heatmap */}
        <div className="animate-fade-up delay-400" style={{ animationFillMode: "both" }}>
          <SectionLabel>Content Activity</SectionLabel>
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Pipeline Heatmap</span>
              <span className="text-xs text-muted-foreground ml-auto">Last 14 weeks</span>
            </div>
            <ActivityHeatmap activeDates={activeDates} weeks={14} />
          </div>
        </div>

        {/* Comparison matrix */}
        <div className="animate-fade-up delay-500" style={{ animationFillMode: "both" }}>
          <SectionLabel>Competitor Matrix</SectionLabel>
          <div className="glass rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_60px] gap-2 px-4 py-2.5 border-b border-white/[0.05] text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
              <span>Channel</span>
              <span className="text-right">Freq</span>
              <span className="text-right">AI%</span>
            </div>

            {COMPETITORS.map((c, i) => (
              <div
                key={c.handle}
                className={`px-4 py-3 animate-slide-left ${c.isOwn ? "bg-primary/[0.06] border-l-2 border-primary" : "hover:bg-white/[0.03]"} transition-colors`}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
              >
                <div className="grid grid-cols-[1fr_60px_60px] gap-2 items-center mb-2">
                  <div>
                    <p className={`text-sm font-semibold ${c.isOwn ? "text-primary" : ""}`}>
                      {c.name}
                      {c.isOwn && (
                        <span className="ml-1.5 text-[9px] bg-primary/20 text-primary rounded px-1 py-0.5">YOU</span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{c.subs} subs</p>
                  </div>
                  <p className={`text-xs text-right font-mono ${c.uploads >= 5 ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {c.uploads}×/wk
                  </p>
                  <p className={`text-xs text-right font-mono font-bold ${c.aiScore >= 80 ? "text-primary" : c.aiScore >= 60 ? "text-amber-400" : "text-muted-foreground"}`}>
                    {c.aiScore}
                  </p>
                </div>
                <ScoreBar
                  value={c.aiScore}
                  max={100}
                  color={c.isOwn ? "#4F6AFF" : c.aiScore >= 80 ? "#A855F7" : c.aiScore >= 60 ? "#F59E0B" : "#6B7280"}
                />
              </div>
            ))}

            <div className="px-4 py-2.5 border-t border-white/[0.05]">
              <p className="text-[9px] text-muted-foreground/40">
                AI% = AI content focus score (estimated). Freq = uploads per week.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Latest YouTube videos ─────────────────────────────── */}
      {videos.length > 0 && (
        <div className="animate-fade-up delay-600" style={{ animationFillMode: "both" }}>
          <SectionLabel>Latest Videos</SectionLabel>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/[0.05]">
              {videos.slice(0, 5).map((video, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors group animate-slide-left"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                >
                  {/* Rank pill */}
                  <div className="h-8 w-8 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground/60 tabular-nums">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.views.toLocaleString()}
                      </span>
                      <span>{timeAgo(video.publishedAt)}</span>
                    </div>
                  </div>
                  {/* Mini view bar */}
                  <div className="hidden sm:block w-16 shrink-0">
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{
                          width: `${Math.min(100, (video.views / Math.max(...videos.map((v) => v.views))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
