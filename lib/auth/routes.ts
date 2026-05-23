/** Routes that require an authenticated session when Supabase is configured. */
export const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/applications",
  "/jobs",
  "/resumes",
  "/cover-letters",
  "/profile",
  "/settings",
  "/onboarding",
] as const;

export const AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
