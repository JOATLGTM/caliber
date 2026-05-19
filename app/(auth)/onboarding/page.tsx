"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Upload,
} from "lucide-react";
import { ChipMulti } from "@/components/caliber/chip-multi";
import { SalarySlider } from "@/components/caliber/salary-slider";
import { Segmented } from "@/components/caliber/segmented";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type WorkMode = "Remote" | "Hybrid" | "Onsite";
type Experience = "Entry" | "Mid" | "Senior" | "Staff+";

const WORK_MODE_OPTIONS = [
  { value: "Remote" as WorkMode, label: "Remote" },
  { value: "Hybrid" as WorkMode, label: "Hybrid" },
  { value: "Onsite" as WorkMode, label: "Onsite" },
];

const EXPERIENCE_OPTIONS = [
  { value: "Entry" as Experience, label: "Entry" },
  { value: "Mid" as Experience, label: "Mid" },
  { value: "Senior" as Experience, label: "Senior" },
  { value: "Staff+" as Experience, label: "Staff+" },
];

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([
    "Senior Backend Engineer",
    "Staff Engineer",
  ]);
  const [locations, setLocations] = useState<string[]>([
    "San Francisco",
    "Remote (US)",
  ]);
  const [workMode, setWorkMode] = useState<WorkMode>("Remote");
  const [experience, setExperience] = useState<Experience>("Senior");
  const fileInput = useRef<HTMLInputElement>(null);

  function next() {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else router.push("/dashboard");
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setResumeName(f.name);
  }

  return (
    <div className="w-full max-w-[540px]">
      <div className="mb-4 font-display text-[18px] font-semibold tracking-[-0.025em]">
        Caliber
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2 text-[12px] text-text-faint">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 items-center gap-2 last:flex-none">
            <div
              className={cn(
                "grid h-[22px] w-[22px] place-items-center rounded-full border text-[11px]",
                step >= i
                  ? "border-text bg-text text-background"
                  : "border-border text-text-faint",
              )}
            >
              {step > i ? <Check size={11} aria-hidden /> : i}
            </div>
            {i < 3 && (
              <div
                className={cn(
                  "h-px flex-1",
                  step > i ? "bg-text" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
        <span className="ml-2 whitespace-nowrap">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      {step === 1 && (
        <div className="rounded-lg border border-border bg-background p-7">
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.025em]">
            Welcome to Caliber.
          </h1>
          <p className="mt-2 text-[15px] text-text-muted">
            Let&apos;s set you up in under 2 minutes. Three quick steps:
          </p>
          <ol className="mt-3.5 list-decimal pl-[18px] text-[14px] leading-[1.9] text-text-muted">
            <li>Upload your resume so we can learn what you&apos;ve done</li>
            <li>Tell us what you want next — roles, locations, salary</li>
            <li>See your first matches</li>
          </ol>
          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={next}>
              Get started <ArrowRight size={14} aria-hidden />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-lg border border-border bg-background p-7">
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.025em]">
            Upload your resume
          </h1>
          <p className="mt-2 text-[14px] text-text-muted">
            PDF or DOCX. We extract your skills and history — never share it.
          </p>

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-4 w-full rounded-lg border border-dashed border-border-strong bg-bg-elev p-12 text-center text-[13.5px] text-text-muted transition-colors hover:bg-bg-elev-2"
          >
            {resumeName ? (
              <>
                <FileText
                  size={22}
                  aria-hidden
                  className="mx-auto mb-2.5 block text-text"
                />
                <div>
                  <strong className="font-medium text-text">
                    Uploaded:
                  </strong>{" "}
                  {resumeName}
                </div>
                <div className="mt-1.5 text-[12px] text-text-faint">
                  Click to replace
                </div>
              </>
            ) : (
              <>
                <Upload
                  size={22}
                  aria-hidden
                  className="mx-auto mb-2.5 block text-text-faint"
                />
                <div>
                  <strong className="font-medium text-text">
                    Drop your resume here
                  </strong>{" "}
                  or click to browse
                </div>
                <div className="mt-1.5 text-[12px] text-text-faint">
                  PDF or DOCX, up to 10MB
                </div>
              </>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFile}
            className="hidden"
          />

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={next}
              className="text-[13.5px] text-text-muted underline decoration-border-strong hover:text-text"
            >
              Skip for now
            </button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={back}>
                <ArrowLeft size={13} aria-hidden /> Back
              </Button>
              <Button onClick={next}>
                Continue <ArrowRight size={13} aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-lg border border-border bg-background p-7">
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.025em]">
            Set preferences
          </h1>
          <p className="mt-2 text-[14px] text-text-muted">
            You can change all of these later in profile.
          </p>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12.5px] font-medium">Target roles</Label>
              <ChipMulti
                values={roles}
                onChange={setRoles}
                placeholder="Add a role"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12.5px] font-medium">Locations</Label>
              <ChipMulti
                values={locations}
                onChange={setLocations}
                placeholder="Add a location"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12.5px] font-medium">Work mode</Label>
              <Segmented
                options={WORK_MODE_OPTIONS}
                value={workMode}
                onChange={setWorkMode}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12.5px] font-medium">
                Minimum salary
              </Label>
              <SalarySlider />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12.5px] font-medium">
                Experience level
              </Label>
              <Segmented
                options={EXPERIENCE_OPTIONS}
                value={experience}
                onChange={setExperience}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={back}>
              <ArrowLeft size={13} aria-hidden /> Back
            </Button>
            <Button size="lg" onClick={() => router.push("/dashboard")}>
              Take me to my dashboard <ArrowRight size={14} aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
