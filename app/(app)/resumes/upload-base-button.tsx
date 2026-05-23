"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadBaseResumeAction } from "@/lib/actions/resume-upload";

interface UploadBaseButtonProps {
  hasBase: boolean;
}

export function UploadBaseButton({ hasBase }: UploadBaseButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadBaseResumeAction(formData);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Base resume uploaded");
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
      >
        {pending ? (
          <Loader2 size={13} aria-hidden className="animate-spin" />
        ) : (
          <Upload size={13} aria-hidden />
        )}
        {pending ? "Uploading…" : hasBase ? "Replace base" : "Upload base"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleChange}
        className="hidden"
      />
      {error && (
        <p
          role="alert"
          className="text-[11.5px] text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
