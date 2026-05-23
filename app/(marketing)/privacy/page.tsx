import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Caliber",
  description: "How Caliber collects, uses, and protects your information.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "What we collect",
    body: [
      "Account info you provide: name, email, phone (optional), location, role preferences.",
      "Resume and cover letter content you upload or generate.",
      "Usage telemetry: pages visited, actions taken, errors. We do not sell this data.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "To match you to jobs, tailor application materials, and operate core product features.",
      "To send transactional emails (account confirmation, password resets) and product updates you opt into.",
      "To improve the Service in aggregate. We do not train third-party general-purpose models on your private content.",
    ],
  },
  {
    heading: "Sharing",
    body: [
      "Service providers: Supabase (auth + database), Stripe (billing), our chosen AI model provider for inference. Each operates under contractual obligations.",
      "We do not sell your personal information.",
      "We may disclose information to comply with law, prevent fraud, or protect rights and safety.",
    ],
  },
  {
    heading: "AI processing",
    body: [
      "Generative features send prompts to an LLM provider (e.g. OpenAI). Prompts may include your resume content and the job description for the role you're tailoring against. Providers process this data to generate outputs and may retain it briefly per their policy.",
      "If you don't want any content sent to an LLM, do not use the Regenerate / Generate buttons.",
    ],
  },
  {
    heading: "Storage and retention",
    body: [
      "Your data lives in Supabase Postgres + Storage in a region we control. Files are private and protected by row-level security keyed to your user id.",
      "If you delete your account we remove your records within 30 days, except where retention is required by law.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can view and edit your profile at /profile. You can delete tailored resumes, cover letters, and applications from inside the app. Contact us to request export or full deletion.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use essential cookies for authentication. We do not use third-party advertising trackers.",
    ],
  },
  {
    heading: "Contact",
    body: ["Privacy questions: privacy@caliber.app"],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-16 md:px-8">
      <h1 className="font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.025em]">
        Privacy Policy
      </h1>
      <p className="mt-2 text-[14px] text-text-faint">Last updated: May 22, 2026</p>

      <div className="mt-8 flex flex-col gap-7">
        {SECTIONS.map((s) => (
          <section key={s.heading} className="flex flex-col gap-2.5">
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
              {s.heading}
            </h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-[14.5px] leading-[1.65] text-text-muted">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
