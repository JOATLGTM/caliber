"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { saveProfileAction } from "@/lib/actions/profile";
import { formatSalaryK, parseSalaryInput } from "@/lib/db/mappers";
import type { Seniority, UserProfile } from "@/lib/mock-data";
import { Chip } from "@/components/caliber/chip";
import { ChipMulti } from "@/components/caliber/chip-multi";
import { Segmented } from "@/components/caliber/segmented";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EXPERIENCE_OPTIONS: { value: Seniority; label: string }[] = [
  { value: "Entry", label: "Entry" },
  { value: "Mid", label: "Mid" },
  { value: "Senior", label: "Senior" },
  { value: "Staff+", label: "Staff+" },
];

const WORK_MODES = ["remote", "hybrid", "onsite"] as const;
type WorkModeKey = (typeof WORK_MODES)[number];

interface ProfileFormProps {
  initial: UserProfile;
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const [baseline] = useState(initial);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [location, setLocation] = useState(initial.location);
  const [roles, setRoles] = useState(initial.targetRoles);
  const [locations, setLocations] = useState(initial.locations);
  const [modes, setModes] = useState(initial.workModes);
  const [salaryMin, setSalaryMin] = useState(formatSalaryK(initial.salaryMin));
  const [salaryTarget, setSalaryTarget] = useState(
    formatSalaryK(initial.salaryTarget),
  );
  const [experience, setExperience] = useState<Seniority>(
    initial.experienceLevel,
  );
  const [skills, setSkills] = useState(initial.skills);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleMode(k: WorkModeKey) {
    setModes((m) => ({ ...m, [k]: !m[k] }));
  }

  function discard() {
    setName(baseline.name);
    setPhone(baseline.phone);
    setLocation(baseline.location);
    setRoles([...baseline.targetRoles]);
    setLocations([...baseline.locations]);
    setModes({ ...baseline.workModes });
    setSalaryMin(formatSalaryK(baseline.salaryMin));
    setSalaryTarget(formatSalaryK(baseline.salaryTarget));
    setExperience(baseline.experienceLevel);
    setSkills([...baseline.skills]);
    setMessage("Discarded unsaved changes");
    toast.message("Discarded unsaved changes");
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProfileAction({
        name,
        phone,
        location,
        targetRoles: roles,
        locations,
        workModes: modes,
        salaryMin: parseSalaryInput(salaryMin),
        salaryTarget: parseSalaryInput(salaryTarget),
        experienceLevel: experience,
        skills,
      });
      if (result.ok) {
        setMessage("Saved");
        toast.success("Profile saved");
      } else {
        setMessage(result.error ?? "Failed to save");
        toast.error(result.error ?? "Failed to save");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 pb-[60px] pt-7 md:px-8">
      <h1 className="font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[26px]">
        Profile
      </h1>
      <p className="mt-1.5 text-[14px] text-text-muted">
        This is what we use to match you. Keep it sharp.
      </p>

      {message && (
        <p
          role="status"
          className={`mt-3 text-[13px] ${
            message === "Saved"
              ? "text-good"
              : message === "Discarded unsaved changes"
                ? "text-text-muted"
                : "text-destructive"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-5">
        <section className="rounded-lg border border-border bg-background p-[22px]">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
            Personal info
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Name" value={name} onChange={setName} disabled={pending} />
            <Field label="Email" value={initial.email} readOnly />
            <Field label="Phone" value={phone} onChange={setPhone} disabled={pending} />
            <Field
              label="Location"
              value={location}
              onChange={setLocation}
              disabled={pending}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-[22px]">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
            What you&apos;re looking for
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-text-muted">Target roles</Label>
              <ChipMulti
                values={roles}
                onChange={setRoles}
                placeholder="Add a role and press Enter…"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-text-muted">Locations</Label>
              <ChipMulti
                values={locations}
                onChange={setLocations}
                placeholder="Add a location and press Enter…"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-text-muted">Work mode</Label>
              <div className="flex flex-wrap gap-2">
                {WORK_MODES.map((k) => (
                  <Chip key={k} on={modes[k]} onClick={() => toggleMode(k)}>
                    {modes[k] && <Check size={12} aria-hidden />}
                    {k[0].toUpperCase() + k.slice(1)}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field
                label="Salary minimum"
                value={salaryMin}
                onChange={setSalaryMin}
                disabled={pending}
              />
              <Field
                label="Salary target"
                value={salaryTarget}
                onChange={setSalaryTarget}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-text-muted">
                Experience level
              </Label>
              <Segmented
                options={EXPERIENCE_OPTIONS}
                value={experience}
                onChange={setExperience}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-[22px]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
              Skills
            </h2>
            <span className="text-[12px] text-text-faint">
              Auto-extracted from your resume
            </span>
          </div>
          <div className="mt-3">
            <ChipMulti
              values={skills}
              onChange={setSkills}
              placeholder="+ Add skill"
            />
          </div>
        </section>

        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={discard}
            disabled={pending}
          >
            Discard
          </Button>
          <Button size="sm" type="button" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] text-text-muted">{label}</Label>
      <Input
        value={value}
        type={type}
        readOnly={readOnly}
        disabled={disabled || readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-9 text-[13.5px]"
      />
    </div>
  );
}
