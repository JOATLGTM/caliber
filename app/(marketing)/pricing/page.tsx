import { FAQ } from "@/components/caliber/faq";
import { PricingGrid } from "@/components/caliber/pricing-grid";

const PRICING_FAQ: [string, string][] = [
  [
    "Can I cancel anytime?",
    "Yes. Cancel from settings; you keep access through the end of the billing period.",
  ],
  [
    "Is there a student discount?",
    "50% off Pro with a verified .edu email. Reach out and we'll set you up.",
  ],
  [
    "What payment methods?",
    "Card via Stripe. Annual billing available with a 20% discount.",
  ],
  [
    "Refund policy?",
    "Full refund within 7 days, no questions.",
  ],
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-[1180px] px-4 pb-10 pt-20 text-center md:px-8">
        <h1 className="mx-auto font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] [max-width:16ch] sm:text-[48px]">
          Simple, honest pricing.
        </h1>
        <p className="mx-auto mt-3.5 max-w-[50ch] text-[17px] text-text-muted">
          Free to start. Pay only when you&apos;re actively job-searching.
        </p>
      </section>

      {/* Pricing grid */}
      <section className="mx-auto max-w-[1180px] px-4 pb-20 md:px-8">
        <PricingGrid />
      </section>

      {/* Pricing FAQ */}
      <section className="mx-auto max-w-[1180px] px-4 py-20 md:px-8">
        <h2 className="mb-3.5 font-display text-[24px] font-semibold tracking-[-0.025em] sm:text-[28px]">
          Pricing FAQ
        </h2>
        <FAQ items={PRICING_FAQ} />
      </section>
    </div>
  );
}
