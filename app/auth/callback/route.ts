import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/onboarding";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback&detail=${encodeURIComponent(oauthError)}`,
    );
  }

  const successRedirect = NextResponse.redirect(`${origin}${next}`);
  const supabase = createRouteHandlerClient(request, successRedirect);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return successRedirect;
    }
    console.error("[auth/callback] exchangeCodeForSession:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return successRedirect;
    }
    console.error("[auth/callback] verifyOtp:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
