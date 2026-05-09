"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Users, Video, TrendingUp, Loader2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

interface ChannelStats { subscriberCount: number; viewCount: number; videoCount: number }
interface VideoStats   { title: string; views: number; likes: number; comments: number; publishedAt: string }

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

/* ── Glassmorphic tooltip ─────────────────────────────────────── */
function GlassTooltip({ active, payload, label }: {
  active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"rgba(6,11,24,0.92)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:12, padding:"10px 14px", backdropFilter:"blur(20px)", fontSize:12 }}>
      <p style={{ color:"rgba(255,255,255,0.5)", marginBottom:6, fontSize:11 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:p.color, flexShrink:0 }}/>
          <span style={{ color:"rgba(255,255,255,0.7)", textTransform:"capitalize" }}>{p.name}:</span>
          <span style={{ color:"#fff", fontWeight:600 }}>{fmtNum(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, color }: {
  label:string; value:string; sub:string; icon:React.ElementType; color:string
}) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group hover:glow-blue transition-all duration-300">
      <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-20 transition-opacity group-hover:opacity-30"
        style={{ background:`radial-gradient(circle,${color} 0%,transparent 70%)` }} />
      <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background:`${color}22`, border:`1px solid ${color}33` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
    </div>
  );
}

/* ── Section header ───────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">{children}</p>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

const CHART_COMMON = {
  stroke: "rgba(255,255,255,0.06)",
  axisStyle: { fill: "rgba(255,255,255,0.35)", fontSize: 11 },
};

export default function AnalyticsPage() {
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const [videos,       setVideos]       = useState<VideoStats[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const fetch$ = useCallback(async () => {
    try {
      const res  = await fetch("/api/youtube");
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setChannelStats(data.channel);
      setVideos(data.videos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch$(); }, [fetch$]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      Loading analytics…
    </div>
  );

  if (error) return (
    <div className="space-y-6 animate-fade-up" style={{ animationFillMode:"both" }}>
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">YouTube channel performance</p>
      </div>
      <div className="glass rounded-2xl p-6">
        <p className="text-muted-foreground">{error}</p>
        <p className="text-sm text-muted-foreground/60 mt-2">
          Set <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-primary text-xs">YOUTUBE_API_KEY</code> and{" "}
          <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-primary text-xs">YOUTUBE_CHANNEL_ID</code> in .env.local
        </p>
      </div>
    </div>
  );

  /* Chart data */
  const chartData = [...videos].reverse().map((v) => ({
    name:     v.title.length > 22 ? v.title.slice(0, 22) + "…" : v.title,
    views:    v.views,
    likes:    v.likes,
    comments: v.comments,
    ratio:    v.views > 0 ? +((v.likes / v.views) * 100).toFixed(2) : 0,
  }));

  const maxViews = Math.max(...chartData.map((d) => d.views), 1);

  /* Radar: performance profile of top video */
  const top = chartData.at(-1);
  const radarData = top
    ? [
        { metric: "Views",    value: Math.round((top.views    / maxViews) * 100) },
        { metric: "Likes",    value: Math.min(100, Math.round((top.likes    / (top.views || 1)) * 2000)) },
        { metric: "Comments", value: Math.min(100, Math.round((top.comments / (top.views || 1)) * 5000)) },
        { metric: "Ratio",    value: Math.min(100, Math.round(top.ratio * 20)) },
        { metric: "Recency",  value: 80 },
      ]
    : [];

  const avgViews = channelStats && channelStats.videoCount > 0
    ? Math.round(channelStats.viewCount / channelStats.videoCount)
    : 0;

  return (
    <div className="space-y-10 pb-8">
      {/* Header */}
      <div className="animate-fade-up" style={{ animationFillMode:"both" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">
          Anilytix Studio
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">YouTube channel performance — real-time data</p>
      </div>

      {/* Stats */}
      {channelStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-100" style={{ animationFillMode:"both" }}>
          <StatCard label="Subscribers"    value={fmtNum(channelStats.subscriberCount)} sub="YouTube channel"   icon={Users}      color="#4F6AFF"/>
          <StatCard label="Total Views"    value={fmtNum(channelStats.viewCount)}        sub="all time"          icon={Eye}        color="#06B6D4"/>
          <StatCard label="Videos"         value={String(channelStats.videoCount)}       sub="published"         icon={Video}      color="#A855F7"/>
          <StatCard label="Avg Views/Video" value={fmtNum(avgViews)}                     sub="per upload"        icon={TrendingUp} color="#10B981"/>
        </div>
      )}

      {chartData.length > 0 && (
        <>
          {/* Views Area Chart */}
          <div className="animate-fade-up delay-200" style={{ animationFillMode:"both" }}>
            <SectionLabel>Views Per Video</SectionLabel>
            <div className="glass rounded-2xl p-5">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top:10, right:10, bottom:60, left:0 }}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4F6AFF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4F6AFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COMMON.stroke}/>
                  <XAxis dataKey="name" tick={CHART_COMMON.axisStyle} angle={-25} textAnchor="end" height={72} interval={0}/>
                  <YAxis tick={CHART_COMMON.axisStyle} tickFormatter={fmtNum} width={50}/>
                  <Tooltip content={<GlassTooltip />}/>
                  <Area type="monotone" dataKey="views" stroke="#4F6AFF" strokeWidth={2}
                    fill="url(#gViews)" dot={{ fill:"#4F6AFF", r:3 }} activeDot={{ r:5 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement bar + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up delay-300" style={{ animationFillMode:"both" }}>
            {/* Likes + Comments bar */}
            <div>
              <SectionLabel>Engagement</SectionLabel>
              <div className="glass rounded-2xl p-5">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top:5, right:5, bottom:60, left:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COMMON.stroke}/>
                    <XAxis dataKey="name" tick={CHART_COMMON.axisStyle} angle={-25} textAnchor="end" height={72} interval={0}/>
                    <YAxis tick={CHART_COMMON.axisStyle} tickFormatter={fmtNum} width={40}/>
                    <Tooltip content={<GlassTooltip />}/>
                    <Legend wrapperStyle={{ fontSize:11, color:"rgba(255,255,255,0.5)", paddingTop:8 }}/>
                    <Bar dataKey="likes"    fill="#EC4899" radius={[3,3,0,0]} name="likes"/>
                    <Bar dataKey="comments" fill="#06B6D4" radius={[3,3,0,0]} name="comments"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar performance score */}
            <div>
              <SectionLabel>Latest Video Score</SectionLabel>
              <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData} margin={{ top:10, right:20, bottom:10, left:20 }}>
                      <PolarGrid stroke="rgba(255,255,255,0.07)"/>
                      <PolarAngleAxis dataKey="metric"
                        tick={{ fill:"rgba(255,255,255,0.45)", fontSize:11 }}/>
                      <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                      <Radar name="Score" dataKey="value" stroke="#4F6AFF" fill="#4F6AFF" fillOpacity={0.2}
                        dot={{ fill:"#4F6AFF", r:3 }}/>
                      <Tooltip content={<GlassTooltip />}/>
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm">No data</p>
                )}
              </div>
            </div>
          </div>

          {/* Like ratio trend */}
          <div className="animate-fade-up delay-400" style={{ animationFillMode:"both" }}>
            <SectionLabel>Like Ratio Trend (%)</SectionLabel>
            <div className="glass rounded-2xl p-5">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top:5, right:10, bottom:60, left:0 }}>
                  <defs>
                    <linearGradient id="gRatio" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="#10B981"/>
                      <stop offset="100%" stopColor="#4F6AFF"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COMMON.stroke}/>
                  <XAxis dataKey="name" tick={CHART_COMMON.axisStyle} angle={-25} textAnchor="end" height={72} interval={0}/>
                  <YAxis tick={CHART_COMMON.axisStyle} unit="%" width={40}/>
                  <Tooltip content={<GlassTooltip />}/>
                  <Line type="monotone" dataKey="ratio" stroke="url(#gRatio)" strokeWidth={2.5} name="like ratio"
                    dot={{ fill:"#10B981", r:3 }} activeDot={{ r:5 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
