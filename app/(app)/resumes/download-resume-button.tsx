"use client";

import { useState, useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getResumeDownloadUrlAction } from "@/lib/actions/resume-upload";

interface DownloadResumeButtonProps {
  resumeId: string;
  label: string;
  variant?: "ghost" | "outline";
  showText?: boolean;
}

export function DownloadResumeButton({
  resumeId,
  label,
  variant = "ghost",
  showText = false,
}: DownloadResumeButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await getResumeDownloadUrlAction(resumeId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        type="button"
        aria-label={`Download ${label}`}
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? (
          <Loader2 size={13} aria-hidden className="animate-spin" />
        ) : (
          <Download size={13} aria-hidden />
        )}
        {showText && <span>{pending ? "Preparing…" : "Download"}</span>}
      </Button>
      {error && (
        <span className="text-[11px] text-destructive" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
