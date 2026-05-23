export function getAuthCallbackUrl(next = "/dashboard"): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const params = new URLSearchParams({ next });
  return `${origin}/auth/callback?${params.toString()}`;
}
