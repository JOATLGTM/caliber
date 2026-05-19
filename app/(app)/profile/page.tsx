"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chip } from "@/components/caliber/chip";
import { ChipMulti } from "@/components/caliber/chip-multi";
import { Segmented } from "@/components/caliber/segmented";
import { USER_PROFILE, type Seniority } from "@/lib/mock-data";

const EXPERIENCE_OPTIONS: { value: Seniority; label: string }[] = [
  { value: "Entry", label: "Entry" },
  { value: "Mid", label: "Mid" },
  { value: "Senior", label: "Senior" },
  { value: "Staff+", label: "Staff+" },
];

const WORK_MODES = ["remote", "hybrid", "onsite"] as const;
type WorkModeKey = (typeof WORK_MODES)[number];

export default function ProfilePage() {
  const [name, setName] = useState(USER_PROFILE.name);
  const [email, setEmail] = useState(USER_PROFILE.email);
  const [phone, setPhone] = useState(USER_PROFILE.phone);
  const [location, setLocation] = useState(USER_PROFILE.location);
  const [roles, setRoles] = useState(USER_PROFILE.targetRoles);
  const [locations, setLocations] = useState(USER_PROFILE.locations);
  const [modes, setModes] = useState(USER_PROFILE.workModes);
  const [salaryMin, setSalaryMin] = useState(
    `$${USER_PROFILE.salaryMin / 1000}k`,
  );
  const [salaryTarget, setSalaryTarget] = useState(
    `$${USER_PROFILE.salaryTarget / 1000}k`,
  );
  const [experience, setExperience] = useState<Seniority>(
    USER_PROFILE.experienceLevel,
  );
  const [skills, setSkills] = useState(USER_PROFILE.skills);

  function toggleMode(k: WorkModeKey) {
    setModes((m) => ({ ...m, [k]: !m[k] }));
  }

  function save() {
    // eslint-disable-next-line no-console
    console.log("profile.save", {
      name,
      email,
      phone,
      location,
      roles,
      locations,
      modes,
      salaryMin,
      salaryTarget,
      experience,
      skills,
    });
  }

  return (
    <div className="mx-auto w-full max-w-[920px] px-8 pb-[60px] pt-7">
      <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em]">
        Profile
      </h1>
      <p className="mt-1.5 text-[14px] text-text-muted">
        This is what we use to match you. Keep it sharp.
      </p>

      <div className="mt-7 flex flex-col gap-5">
        {/* Personal info */}
        <section className="rounded-lg border border-border bg-background p-[22px]">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
            Personal info
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3.5">
            <Field label="Name" value={name} onChange={setName} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Location" value={location} onChange={setLocation} />
          </div>
        </section>

        {/* What you're looking for */}
        <section className="rounded-lg border border-border bg-background p-[22px]">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
            What you&apos;re looking for
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-text-muted">
                Target roles
              </Label>
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

            <div className="grid grid-cols-2 gap-3.5">
              <Field
                label="Salary minimum"
                value={salaryMin}
                onChange={setSalaryMin}
              />
              <Field
                label="Salary target"
                value={salaryTarget}
                onChange={setSalaryTarget}
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

        {/* Skills */}
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
          <Button variant="ghost" size="sm">
            Discard
          </Button>
          <Button size="sm" onClick={save}>
            Save changes
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] text-text-muted">{label}</Label>
      <Input
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-[13.5px]"
      />
    </div>
  );
}
