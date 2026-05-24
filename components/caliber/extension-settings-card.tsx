"use client";

import { useCallback, useState } from "react";
import { Copy, Loader2, Puzzle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ExtensionSettingsCard() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadToken = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        toast.error("Not signed in");
        return;
      }
      setToken(accessToken);
      toast.success("Token ready — copy it into the extension");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load session");
    } finally {
      setLoading(false);
    }
  }, []);

  async function copyToken() {
    if (!token) {
      await loadToken();
      return;
    }
    try {
      await navigator.clipboard.writeText(token);
      toast.success("Token copied");
    } catch {
      toast.error("Could not copy — select and copy manually");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-start gap-3">
        <Puzzle size={18} className="mt-0.5 text-good" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-medium text-text">Browser extension</h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Autofill Greenhouse, Lever, and Ashby apply forms from your profile.
            Load unpacked from{" "}
            <code className="text-[12px] text-text-faint">caliber/extension</code>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadToken}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                "Show access token"
              )}
            </Button>
            <Button type="button" size="sm" onClick={copyToken} disabled={loading}>
              <Copy size={14} aria-hidden />
              Copy token
            </Button>
          </div>
          {token && (
            <div className="mt-3">
              <Label className="text-[11px] text-text-faint">Access token (expires ~1h)</Label>
              <Input
                readOnly
                value={token}
                className="mt-1 font-mono text-[11px]"
                onFocus={(e) => e.target.select()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
