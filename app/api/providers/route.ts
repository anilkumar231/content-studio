import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// GET /api/providers — list all provider settings (keys masked)
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("provider_settings")
    .select("id,provider,is_active,plan,added_at")
    .order("added_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ providers: data || [] });
}

// POST /api/providers — upsert a provider key
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { provider, api_key, plan } = body as {
    provider: string;
    api_key: string;
    plan?: string;
  };

  if (!provider || !api_key) {
    return Response.json({ error: "provider and api_key are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Upsert by provider name
  const { data, error } = await supabase
    .from("provider_settings")
    .upsert(
      { provider, api_key, plan: plan || null, is_active: true },
      { onConflict: "provider" }
    )
    .select("id,provider,is_active,plan,added_at")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ provider: data });
}

// DELETE /api/providers — remove a provider key
export async function DELETE(req: NextRequest) {
  const { provider } = await req.json();
  if (!provider) {
    return Response.json({ error: "provider is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("provider_settings")
    .delete()
    .eq("provider", provider);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

// PATCH /api/providers — toggle is_active
export async function PATCH(req: NextRequest) {
  const { provider, is_active } = await req.json();
  if (!provider || is_active === undefined) {
    return Response.json({ error: "provider and is_active are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("provider_settings")
    .update({ is_active })
    .eq("provider", provider)
    .select("id,provider,is_active,plan,added_at")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ provider: data });
}
