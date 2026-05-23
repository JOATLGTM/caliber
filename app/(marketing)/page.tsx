import Link from "next/link";
import {
  ArrowRight,
  Check,
  List,
  Mail,
  Shield,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { FAQ } from "@/components/caliber/faq";
import { PricingGrid } from "@/components/caliber/pricing-grid";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    n: "01",
    t: "Connect your resume",
    d: "Upload your base resume. We extract your skills, history, and trajectory.",
  },
  {
    n: "02",
    t: "We match you to high-fit jobs",
    d: "Daily, sorted by fit — with the reasoning visible. No hidden ranking, no spam.",
  },
  {
    n: "03",
    t: "Tailor and apply with confidence",
    d: "Per-job resume + cover letter, scored before you hit submit.",
  },
];

const FEATURES = [
  {
    Icon: Zap,
    t: "Smart job matching",
    d: "Fit scoring across skills, salary, location, seniority, and trajectory.",
  },
  {
    Icon: Sparkles,
    t: "Resume tailoring per job",
    d: "Per-application bullet rewrites grounded in your actual experience.",
  },
  {
    Icon: Shield,
    t: "Why-this-match transparency",
    d: "Every score comes with reasoning. No black box, no surprises.",
  },
  {
    Icon: Trophy,
    t: "Application quality score",
    d: "ATS keyword coverage, quantified impact, length, voice — scored before you send.",
  },
  {
    Icon: Mail,
    t: "Cover letters that don't sound like AI",
    d: "Drafts you'd actually send. Editable, exportable, never robotic.",
  },
  {
    Icon: List,
    t: "Application tracker",
    d: "Kanban pipeline so nothing falls through. Outcome data feeds your matches.",
  },
];

const DO_LIST = [
  "Tailored applications, every time",
  "Quality scoring before you submit",
  "Honest match reasoning — strengths and gaps",
  "ATS-friendly output you can take anywhere",
];

const DONT_LIST = [
  "Mass auto-apply to anything that moves",
  "Spammy LinkedIn extensions",
  "Sketchy interview “cheating” tools",
  "Inflated resumes that don't survive a recruiter call",
];

const LANDING_FAQ: [string, string][] = [
  [
    "How is this different from LinkedIn Easy Apply?",
    "LinkedIn rewards volume — we reward fit. Caliber surfaces fewer jobs and helps you put real effort into the ones that matter, with reasoning for every match.",
  ],
  [
    "Where do the jobs come from?",
    "We aggregate from company career pages, ATSes (Greenhouse, Lever, Ashby, Workday), and trusted boards. Postings link back to the source — we never proxy or re-host.",
  ],
  [
    "Will my resume actually pass ATS?",
    "Yes. We export clean DOCX with parseable structure, score keyword coverage against the JD, and warn you when something common is missing.",
  ],
  [
    "Do I have to pay to get started?",
    "No. The free tier matches you to 50 jobs a month and gives you 5 tailorings. Upgrade only if you're applying actively.",
  ],
  [
    "How does the AI tailor my resume?",
    "It rewrites your bullets toward the role's vocabulary while staying grounded in your actual experience. You see every change with reasoning. Nothing fabricated.",
  ],
  [
    "What if I'm not in tech?",
    "Caliber is field-agnostic. We have users in design, product, marketing, healthcare, finance, and customer success. The matching primitives are the same.",
  ],
];

const LOGOS = ["Stripe", "Notion", "Figma", "Vercel", "Linear", "Plaid"];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-[1180px] px-4 pb-20 pt-20 md:px-8">
        <h1 className="font-display font-semibold leading-[1.02] tracking-[-0.035em] [font-size:clamp(40px,6vw,64px)] [max-width:18ch]">
          Stop applying to 100 jobs.
          <br />
          Start landing 5 interviews.
        </h1>
        <p className="mt-5 max-w-[56ch] text-[18px] leading-[1.5] text-text-muted">
          Caliber finds the jobs that actually fit you, then helps you tailor
          every application so it lands. Quality over quantity, every time.
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Button asChild size="lg">
            <Link href="/signup">
              Get started — it&apos;s free <ArrowRight size={14} aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-[1180px] px-4 pb-12 md:px-8">
        <div className="mb-[18px] text-[12px] uppercase tracking-[0.06em] text-text-faint">
          Trusted by job seekers from
        </div>
        <div className="flex flex-wrap items-center gap-x-[38px] gap-y-3 font-display text-[16px] font-medium tracking-[-0.01em] text-text-faint">
          {LOGOS.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto max-w-[1180px] px-4 py-20 md:px-8"
      >
        <h2 className="mb-9 font-display text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">
          How it works
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t border-border pt-[18px]">
              <div className="font-mono text-[12px] text-text-faint">{s.n}</div>
              <h3 className="mb-1.5 mt-1.5 text-[17px] font-semibold">
                {s.t}
              </h3>
              <p className="text-[13.5px] leading-[1.55] text-text-muted">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-[1180px] px-4 py-20 md:px-8">
        <h2 className="mb-7 font-display text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">
          Built for the work, not the volume.
        </h2>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, t, d }) => (
            <div key={t} className="bg-background p-7">
              <div className="mb-4 grid h-7 w-7 place-items-center rounded-md bg-bg-elev-2 text-text">
                <Icon size={14} aria-hidden />
              </div>
              <h3 className="mb-1.5 text-[15px] font-semibold">{t}</h3>
              <p className="text-[13.5px] text-text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we do / don't */}
      <section className="mx-auto max-w-[1180px] px-4 py-20 md:px-8">
        <h2 className="mb-7 font-display text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">
          The opposite of mass apply.
        </h2>
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-border md:grid-cols-2 md:divide-x md:divide-border">
          <div className="p-8">
            <div className="mb-3.5 flex items-center gap-2">
              <Check size={16} className="text-good" aria-hidden />
              <h3 className="text-[15px] font-semibold">What we do</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {DO_LIST.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[14px]"
                >
                  <Check
                    size={14}
                    className="mt-[3px] flex-shrink-0 text-good"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8">
            <div className="mb-3.5 flex items-center gap-2">
              <X size={16} className="text-bad" aria-hidden />
              <h3 className="text-[15px] font-semibold">What we don&apos;t</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {DONT_LIST.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[14px]"
                >
                  <X
                    size={14}
                    className="mt-[3px] flex-shrink-0 text-bad"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="mx-auto max-w-[1180px] px-4 py-20 md:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">
            Simple pricing.
          </h2>
          <Link
            href="/pricing"
            className="text-[14px] text-text-muted hover:text-text"
          >
            Full pricing →
          </Link>
        </div>
        <PricingGrid compact showSeeAll />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[1180px] px-4 py-20 md:px-8">
        <h2 className="mb-3.5 font-display text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">
          Frequently asked.
        </h2>
        <FAQ items={LANDING_FAQ} />
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1180px] px-4 py-20 text-center md:px-8">
          <h2 className="font-display text-[28px] font-semibold tracking-[-0.03em] sm:text-[36px]">
            Ready to apply smarter?
          </h2>
          <p className="mt-3 text-[16px] text-text-muted">
            Free to start. No credit card. About 90 seconds to your first
            matches.
          </p>
          <Button asChild size="lg" className="mt-[22px]">
            <Link href="/signup">
              Get started <ArrowRight size={14} aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
