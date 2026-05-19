import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Tier {
  name: string;
  amount: string;
  per: string;
  description: string;
  cta: string;
  primary: boolean;
  featured?: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: "Free",
    amount: "$0",
    per: "forever",
    description: "Try Caliber and see your matches.",
    cta: "Get started",
    primary: false,
    features: [
      "50 matched jobs / mo",
      "5 resume tailorings / mo",
      "1 base resume",
      "Basic application tracker",
    ],
  },
  {
    name: "Pro",
    amount: "$19",
    per: "/mo",
    description: "For active job seekers.",
    cta: "Start Pro",
    primary: true,
    featured: true,
    features: [
      "Unlimited matched jobs",
      "Unlimited tailoring",
      "Unlimited resumes",
      "Full application tracker",
      "Cover letter generation",
      "Why-this-match insights",
    ],
  },
  {
    name: "Pro+",
    amount: "$39",
    per: "/mo",
    description: "For serious career moves.",
    cta: "Start Pro+",
    primary: false,
    features: [
      "Everything in Pro",
      "Application quality scoring",
      "Outcome analytics",
      "Interview prep tools",
      "Priority support",
    ],
  },
];

export function PricingGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {TIERS.map((t) => (
        <div
          key={t.name}
          className={cn(
            "relative flex flex-col rounded-lg border border-border bg-background p-6 sm:p-7",
            t.featured && "border-text",
          )}
        >
          {t.featured && (
            <div className="absolute -top-2.5 left-6 inline-flex h-[22px] items-center rounded-[4px] bg-text px-2 text-[11px] font-medium text-background sm:left-7">
              Most popular
            </div>
          )}
          <div className="text-[13px] font-medium text-text-muted">
            {t.name}
          </div>
          <div className="mt-3 font-display text-[36px] font-semibold leading-none tracking-[-0.025em]">
            {t.amount}
            <small className="text-[15px] font-medium text-text-faint">
              {" "}
              {t.per}
            </small>
          </div>
          <div className="mt-2 text-[13px] text-text-muted">
            {t.description}
          </div>
          <ul className="mt-5 flex flex-col gap-2 text-[13.5px]">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check
                  size={13}
                  aria-hidden
                  className="mt-1 flex-shrink-0 text-text"
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            variant={t.primary ? "default" : "outline"}
            className="mt-7"
          >
            <Link href="/signup">{t.cta}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
