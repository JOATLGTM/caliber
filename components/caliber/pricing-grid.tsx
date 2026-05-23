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

interface PricingGridProps {
  /** Compact variant for landing-page previews — fewer features, smaller chrome. */
  compact?: boolean;
  /** When provided, renders a "See all plans" link below the grid. */
  showSeeAll?: boolean;
}

export function PricingGrid({ compact = false, showSeeAll = false }: PricingGridProps) {
  const previewLimit = compact ? 3 : Infinity;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={cn(
              "relative flex flex-col rounded-lg border border-border bg-background",
              compact ? "p-5" : "p-6 sm:p-7",
              t.featured && "border-text",
            )}
          >
            {t.featured && (
              <div
                className={cn(
                  "absolute -top-2.5 inline-flex h-[22px] items-center rounded-[4px] bg-text px-2 text-[11px] font-medium text-background",
                  compact ? "left-5" : "left-6 sm:left-7",
                )}
              >
                Most popular
              </div>
            )}
            <div className="text-[13px] font-medium text-text-muted">
              {t.name}
            </div>
            <div
              className={cn(
                "mt-3 font-display font-semibold leading-none tracking-[-0.025em]",
                compact ? "text-[28px]" : "text-[36px]",
              )}
            >
              {t.amount}
              <small className="text-[15px] font-medium text-text-faint">
                {" "}
                {t.per}
              </small>
            </div>
            <div className="mt-2 text-[13px] text-text-muted">
              {t.description}
            </div>
            <ul
              className={cn(
                "flex flex-col gap-2 text-[13.5px]",
                compact ? "mt-4" : "mt-5",
              )}
            >
              {t.features.slice(0, previewLimit).map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check
                    size={13}
                    aria-hidden
                    className="mt-1 flex-shrink-0 text-text"
                  />
                  <span>{f}</span>
                </li>
              ))}
              {compact && t.features.length > previewLimit && (
                <li className="text-[12px] text-text-faint">
                  + {t.features.length - previewLimit} more
                </li>
              )}
            </ul>
            <Button
              asChild
              variant={t.primary ? "default" : "outline"}
              className={cn(compact ? "mt-5" : "mt-7")}
              size={compact ? "sm" : "default"}
            >
              <Link href="/signup">{t.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
      {showSeeAll && (
        <div className="mt-5 text-center text-[13px]">
          <Link
            href="/pricing"
            className="text-text-muted underline decoration-border-strong hover:text-text"
          >
            See all plan details →
          </Link>
        </div>
      )}
    </>
  );
}
