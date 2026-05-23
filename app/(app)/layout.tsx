import { AppHeader } from "@/components/caliber/app-header";
import { AppSidebar } from "@/components/caliber/app-sidebar";
import { bootstrapUserData } from "@/lib/db/bootstrap";
import { listApplications } from "@/lib/db/applications";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await bootstrapUserData();

  let applicationsCount = 0;
  try {
    const apps = await listApplications();
    applicationsCount = apps.length;
  } catch {
    // Unauthenticated or DB not migrated yet
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background md:grid-cols-[240px_1fr]">
      <AppSidebar applicationsCount={applicationsCount} />
      <div className="flex min-w-0 flex-col">
        <AppHeader applicationsCount={applicationsCount} />
        {children}
      </div>
    </div>
  );
}
