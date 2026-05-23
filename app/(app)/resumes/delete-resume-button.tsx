"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteResumeAction } from "@/lib/actions/resumes";

export function DeleteResumeButton({
  resumeId,
  label,
}: {
  resumeId: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${label}"?`)) return;
    startTransition(async () => {
      const res = await deleteResumeAction(resumeId);
      if (res?.ok === false) toast.error(res.error ?? "Failed to delete");
      else toast.success("Resume deleted");
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`Delete ${label}`}
      onClick={handleDelete}
      disabled={pending}
    >
      <Trash2 size={13} aria-hidden />
    </Button>
  );
}
