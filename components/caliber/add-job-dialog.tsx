"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/caliber/segmented";
import { addManualJobAction } from "@/lib/actions/jobs";
import type { WorkMode } from "@/lib/mock-data";
import { jobDetailPath } from "@/lib/jobs/paths";

const WORK_MODES: { value: WorkMode; label: string }[] = [
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Onsite", label: "Onsite" },
];

export function AddJobDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("Remote");
  const [applyUrl, setApplyUrl] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setCompany("");
    setTitle("");
    setLocation("");
    setWorkMode("Remote");
    setApplyUrl("");
    setDescription("");
  }

  function submit() {
    if (!company.trim() || !title.trim()) {
      toast.error("Company and title are required");
      return;
    }

    startTransition(async () => {
      const result = await addManualJobAction({
        company: company.trim(),
        title: title.trim(),
        location: location.trim(),
        workMode,
        applyUrl: applyUrl.trim() || undefined,
        description: description.trim() || undefined,
      });

      if (!result.ok) {
        toast.error(result.error ?? "Could not add job");
        return;
      }

      toast.success("Job added to your pipeline");
      setOpen(false);
      reset();
      router.push(jobDetailPath(result.jobId));
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus size={14} aria-hidden /> Add job manually
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add job manually</DialogTitle>
          <DialogDescription>
            Track a role that is not in the Caliber catalog. Only you can see this job.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <Label htmlFor="manual-company">Company</Label>
            <Input
              id="manual-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={pending}
            />
          </div>
          <div>
            <Label htmlFor="manual-title">Job title</Label>
            <Input
              id="manual-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
            />
          </div>
          <div>
            <Label htmlFor="manual-location">Location</Label>
            <Input
              id="manual-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote"
              disabled={pending}
            />
          </div>
          <div>
            <Label>Work mode</Label>
            <Segmented
              options={WORK_MODES}
              value={workMode}
              onChange={setWorkMode}
            />
          </div>
          <div>
            <Label htmlFor="manual-apply">Apply URL (optional)</Label>
            <Input
              id="manual-apply"
              type="url"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              placeholder="https://…"
              disabled={pending}
            />
          </div>
          <div>
            <Label htmlFor="manual-desc">Notes / description (optional)</Label>
            <Input
              id="manual-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={pending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? (
              <Loader2 size={14} className="animate-spin" aria-hidden />
            ) : (
              "Add job"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
