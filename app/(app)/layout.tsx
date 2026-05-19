import { AppHeader } from "@/components/caliber/app-header";
import { AppSidebar } from "@/components/caliber/app-sidebar";
import { APPLICATIONS } from "@/lib/mock-data";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background md:grid-cols-[240px_1fr]">
      <AppSidebar applicationsCount={APPLICATIONS.length} />
      <div className="flex min-w-0 flex-col">
        <AppHeader applicationsCount={APPLICATIONS.length} />
        {children}
      </div>
    </div>
  );
}
