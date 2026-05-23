"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteCoverLetterAction } from "@/lib/actions/cover-letters";

export function DeleteCoverLetterButton({
  coverLetterId,
  label,
}: {
  coverLetterId: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete cover letter for "${label}"?`)) return;
    startTransition(async () => {
      const res = await deleteCoverLetterAction(coverLetterId);
      if (res?.ok === false) toast.error(res.error ?? "Failed to delete");
      else toast.success("Cover letter deleted");
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="ml-auto text-bad hover:text-bad"
      onClick={handleDelete}
      disabled={pending}
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
