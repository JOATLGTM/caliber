import { MarketingFooter } from "@/components/caliber/marketing-footer";
import { MarketingNav } from "@/components/caliber/marketing-nav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-text">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
