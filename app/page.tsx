"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Eye,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ExternalLink,
  Clapperboard,
  Calendar,
  FileText,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PipelineRun {
  id: string;
  topic: string;
  status: string;
  title: string | null;
  video_id: string | null;
  test_mode: boolean;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

interface YouTubeVideo {
  title: string;
  views: number;
  publishedAt: string;
  videoId?: string;
}

interface ChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

function statusIcon(status: string) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />;
  if (status === "failed") return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
  if (status === "started") return <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />;
  return <Clock className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function statusBadge(status: string) {
  if (status === "completed") return <Badge className="bg-green-500/15 text-green-400 border-green-500/25 text-[10px] py-0">done</Badge>;
  if (status === "failed") return <Badge className="bg-destructive/15 text-destructive border-destructive/25 text-[10px] py-0">failed</Badge>;
  if (status === "started") return <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] py-0">running</Badge>;
  return <Badge variant="outline" className="text-[10px] py-0">{status}</Badge>;
}

function elapsed(started: string, completed: string | null) {
  const end = completed ? new Date(completed) : new Date();
  const secs = Math.floor((end.getTime() - new Date(started).getTime()) / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [runsRes, youtubeRes] = await Promise.all([
        supabase
          .from("pipeline_runs")
          .select("id,topic,status,title,video_id,test_mode,started_at,completed_at,duration_seconds")
          .order("started_at", { ascending: false })
          .limit(8),
        fetch("/api/youtube").then((r) => r.json()).catch(() => null),
      ]);

      setRuns(runsRes.data || []);
      if (youtubeRes) {
        setVideos(youtubeRes.videos || []);
        setChannelStats(youtubeRes.channel || null);
      }
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll every 15s if there's an active run
    const interval = setInterval(() => {
      if (runs.some((r) => r.status === "started")) fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchData, runs]);

  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const activeRun = runs.find((r) => r.status === "started");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting}, Anil
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Anilytix Studio &mdash; AI &amp; Technology &bull; Hinglish
          </p>
        </div>

        {activeRun && (
          <div className="flex items-center gap-2 text-sm bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
            <span className="text-primary font-medium">Pipeline running</span>
            <span className="text-muted-foreground text-xs truncate max-w-[180px]">
              {activeRun.topic}
            </span>
          </div>
        )}
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Subscribers"
          value={channelStats ? channelStats.subscriberCount.toLocaleString() : "—"}
          icon={Users}
          sub="YouTube channel"
        />
        <StatCard
          label="Total Views"
          value={channelStats ? channelStats.viewCount.toLocaleString() : "—"}
          icon={Eye}
          sub="all time"
        />
        <StatCard
          label="Pipeline Runs"
          value={completedRuns}
          icon={Zap}
          sub="completed"
        />
        <StatCard
          label="Videos"
          value={channelStats ? channelStats.videoCount.toLocaleString() : "—"}
          icon={TrendingUp}
          sub="published"
        />
      </div>

      {/* ── Pipeline runs + Quick actions ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pipeline runs — 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Pipeline Runs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {loading ? (
              <p className="text-sm text-muted-foreground px-6 pb-6">Loading...</p>
            ) : runs.length === 0 ? (
              <div className="px-6 pb-6 text-center py-8">
                <Zap className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pipeline runs yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Run <code className="bg-muted px-1 rounded text-xs">python main.py</code> to start.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors"
                  >
                    {statusIcon(run.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">
                        {run.title || run.topic}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {statusBadge(run.status)}
                        <span className="text-[11px] text-muted-foreground">
                          {elapsed(run.started_at, run.completed_at)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {timeAgo(run.started_at)}
                        </span>
                        {run.test_mode && (
                          <span className="text-[10px] text-muted-foreground/60 italic">test</span>
                        )}
                      </div>
                    </div>
                    {run.video_id && (
                      <a
                        href={`https://youtube.com/watch?v=${run.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        <Play className="h-3 w-3" />
                        Watch
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions — 1/3 width */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-0.5">
            Quick Actions
          </p>

          <a
            href="/video"
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all group"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Clapperboard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Create Video</p>
              <p className="text-xs text-muted-foreground">Research → Script → Publish</p>
            </div>
          </a>

          <a
            href="/calendar"
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all group"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Schedule Content</p>
              <p className="text-xs text-muted-foreground">Plan your content calendar</p>
            </div>
          </a>

          <a
            href="/repurpose"
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all group"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Repurpose Video</p>
              <p className="text-xs text-muted-foreground">YouTube → LinkedIn, X, Instagram</p>
            </div>
          </a>
        </div>
      </div>

      {/* ── Recent YouTube videos ───────────────────────────────── */}
      {videos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Play className="h-4 w-4 text-red-400" />
              Latest Videos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="divide-y divide-border">
              {videos.slice(0, 5).map((video, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate leading-tight">{video.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>{video.views.toLocaleString()} views</span>
                      <span>{timeAgo(video.publishedAt)}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
