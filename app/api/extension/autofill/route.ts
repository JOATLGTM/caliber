import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

export interface ExtensionAutofillPayload {
  name: string;
  email: string;
  phone: string;
  location: string;
  targetRoles: string[];
  skills: string[];
  resumeText?: string;
}

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500, headers },
    );
  }

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401, headers });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "full_name, phone, location, preferred_locations, target_roles, skills, resume_text",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500, headers },
    );
  }

  const metaName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  const preferredLocations =
    (profile?.preferred_locations as string[] | null) ?? [];
  const location =
    profile?.location?.trim() ||
    preferredLocations.find((l) => l.trim())?.trim() ||
    "";

  const payload: ExtensionAutofillPayload = {
    name: (profile?.full_name?.trim() || metaName).trim(),
    email: user.email ?? "",
    phone: profile?.phone?.trim() ?? "",
    location,
    targetRoles: (profile?.target_roles as string[] | null) ?? [],
    skills: (profile?.skills as string[] | null) ?? [],
    resumeText: profile?.resume_text?.trim() || undefined,
  };

  return NextResponse.json(payload, { headers });
}
