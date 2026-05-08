"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

interface ProviderRecord {
  id: string;
  provider: string;
  is_active: boolean;
  plan: string | null;
  added_at: string;
}

interface ProviderDef {
  id: string;
  label: string;
  category: string;
  description: string;
  planLabel: string;
  docsUrl: string;
  fallback: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    id: "higgsfield",
    label: "Higgsfield",
    category: "Cinematic Video",
    description: "Cinema Studio 3.0 — AI cinematic video generation with scene composition.",
    planLabel: "Business $49/mo",
    docsUrl: "https://higgsfield.ai",
    fallback: "OpenMontage (free)",
  },
  {
    id: "elevenlabs",
    label: "ElevenLabs",
    category: "Voice",
    description: "Voice clone with emotional range, multilingual support.",
    planLabel: "Creator $22/mo",
    docsUrl: "https://elevenlabs.io",
    fallback: "Edge TTS — en-IN-PrabhatNeural (free)",
  },
  {
    id: "heygen",
    label: "HeyGen",
    category: "Avatar",
    description: "Engine IV lip-sync avatar overlaid on video.",
    planLabel: "Creator $29/mo",
    docsUrl: "https://heygen.com",
    fallback: "No avatar overlay",
  },
  {
    id: "falai",
    label: "fal.ai",
    category: "Video (alt)",
    description: "MiniMax video generation — pay-per-use alternative to Higgsfield.",
    planLabel: "Pay per use",
    docsUrl: "https://fal.ai",
    fallback: "OpenMontage (free)",
  },
  {
    id: "blotato",
    label: "Blotato",
    category: "Distribution",
    description: "Publish to all platforms in one click — YouTube, Instagram, TikTok, LinkedIn.",
    planLabel: "$49/mo",
    docsUrl: "https://blotato.com",
    fallback: "YouTube API only (free)",
  },
];

const CATEGORY_ORDER = ["Cinematic Video", "Voice", "Avatar", "Video (alt)", "Distribution"];

function maskKey(key: string) {
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

function ProviderRow({
  def,
  record,
  onSave,
  onDelete,
  onToggle,
}: {
  def: ProviderDef;
  record: ProviderRecord | null;
  onSave: (id: string, key: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, active: boolean) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const isConfigured = !!record;
  const isActive = record?.is_active ?? false;

  async function handleSave() {
    if (!keyInput.trim()) return;
    setSaving(true);
    await onSave(def.id, keyInput.trim());
    setKeyInput("");
    setExpanded(false);
    setSaving(false);
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* ── Header row ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {isConfigured && isActive ? (
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{def.label}</span>
            <Badge variant="outline" className="text-xs py-0 px-1.5">
              {def.category}
            </Badge>
            {isConfigured && (
              <Badge
                className={`text-xs py-0 px-1.5 ${isActive ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-muted text-muted-foreground"}`}
              >
                {isActive ? "Active" : "Paused"}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{def.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">{def.planLabel}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/20 space-y-3">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Fallback when not configured: </span>
            {def.fallback}
          </div>

          {isConfigured ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  className="font-mono text-xs h-8"
                  value={showKey ? "Stored securely in Supabase" : maskKey("stored")}
                  readOnly
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => onToggle(def.id, !isActive)}
                >
                  {isActive ? "Pause" : "Activate"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => onDelete(def.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove key
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                className="h-8 text-sm font-mono"
                placeholder="Paste API key..."
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <Button
                size="sm"
                className="h-8 shrink-0"
                onClick={handleSave}
                disabled={saving || !keyInput.trim()}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}

          <a
            href={def.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            Get API key →
          </a>
        </div>
      )}
    </div>
  );
}

export function ProviderSettings() {
  const [records, setRecords] = useState<ProviderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/providers");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setRecords(json.providers || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  async function handleSave(provider: string, api_key: string) {
    const res = await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, api_key }),
    });
    const json = await res.json();
    if (json.error) { setError(json.error); return; }
    await fetchProviders();
  }

  async function handleDelete(provider: string) {
    const res = await fetch("/api/providers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    const json = await res.json();
    if (json.error) { setError(json.error); return; }
    await fetchProviders();
  }

  async function handleToggle(provider: string, is_active: boolean) {
    const res = await fetch("/api/providers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, is_active }),
    });
    const json = await res.json();
    if (json.error) { setError(json.error); return; }
    await fetchProviders();
  }

  const recordMap = Object.fromEntries(records.map((r) => [r.provider, r]));
  const activeCount = records.filter((r) => r.is_active).length;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    providers: PROVIDERS.filter((p) => p.category === cat),
  }));

  if (loading) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading providers...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Premium Providers</h2>
          <p className="text-sm text-muted-foreground">
            Add API keys to unlock premium tools. The pipeline auto-selects the best available option.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {activeCount} / {PROVIDERS.length} active
        </Badge>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {grouped.map(({ category, providers }) => (
        <Card key={category}>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {providers.map((def) => (
              <ProviderRow
                key={def.id}
                def={def}
                record={recordMap[def.id] ?? null}
                onSave={handleSave}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-muted-foreground">
        Keys are stored in your Supabase database and read by the Anilytix pipeline at runtime.
        They are never logged or exposed in the UI.
      </p>
    </div>
  );
}
