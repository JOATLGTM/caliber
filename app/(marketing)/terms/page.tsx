import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Caliber",
  description: "The terms governing your use of Caliber.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Acceptance of terms",
    body: [
      "By creating an account or using Caliber (the “Service”), you agree to these Terms of Service. If you do not agree, do not use the Service.",
      "We may update these terms occasionally; material changes are announced in-app and via email.",
    ],
  },
  {
    heading: "2. The Service",
    body: [
      "Caliber helps you discover well-matched job postings, tailor your resume and cover letters per role, and track applications. We do not auto-apply on your behalf.",
      "Outputs from generative-AI features are drafts. You are responsible for reviewing them before sending to any employer.",
    ],
  },
  {
    heading: "3. Your account",
    body: [
      "You must be 18+ and provide accurate signup information. You are responsible for maintaining the security of your account credentials.",
      "Notify us immediately of unauthorized access; we are not liable for losses arising from your failure to keep credentials secure.",
    ],
  },
  {
    heading: "4. Acceptable use",
    body: [
      "Don't violate the law, infringe IP, or send spam. Don't reverse-engineer the Service or attempt to extract proprietary models. Don't impersonate another person.",
      "We may suspend or terminate accounts that abuse the Service.",
    ],
  },
  {
    heading: "5. Subscriptions and billing",
    body: [
      "Paid plans are billed via Stripe. Your subscription auto-renews until cancelled. You can cancel at any time from Settings; access continues through the end of the current billing period.",
      "Refunds: full refund within 7 days of first purchase. After that, no refunds for partially used periods.",
    ],
  },
  {
    heading: "6. Content and AI outputs",
    body: [
      "You retain ownership of resumes, cover letters, and other content you upload or generate. You grant us a limited license to store and process this content to operate the Service.",
      "You should not upload confidential third-party material you are not authorized to share.",
    ],
  },
  {
    heading: "7. Disclaimer",
    body: [
      "The Service is provided “as is.” Caliber does not guarantee employment, interviews, or any specific outcome.",
      "To the maximum extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.",
    ],
  },
  {
    heading: "8. Limitation of liability",
    body: [
      "Our aggregate liability arising out of or relating to the Service is limited to the amount you paid us in the 12 months preceding the event giving rise to the claim, or USD $100, whichever is greater.",
    ],
  },
  {
    heading: "9. Termination",
    body: [
      "You may stop using the Service at any time and request account deletion. We may suspend or terminate your access for breach of these terms.",
    ],
  },
  {
    heading: "10. Contact",
    body: ["Questions: hello@caliber.app"],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-16 md:px-8">
      <h1 className="font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.025em]">
        Terms of Service
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
