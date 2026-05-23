import { DashboardView } from "./dashboard-view";
import { getDashboardEmptyHint, getDashboardStats } from "@/lib/db/dashboard-stats";
import {
  listJobsForUser,
  type JobSortKey,
} from "@/lib/db/jobs";
import { getProfile } from "@/lib/db/profile";

function parsePage(value: string | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function parseSort(value: string | undefined): JobSortKey {
  if (value === "match" || value === "salary") return value;
  return "date";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const sortBy = parseSort(params.sort);

  const [jobResult, profile, stats, emptyHint] = await Promise.all([
    listJobsForUser({ page, sortBy }),
    getProfile(),
    getDashboardStats(),
    getDashboardEmptyHint(),
  ]);
  const firstName = profile.name.split(" ")[0] ?? "there";

  return (
    <DashboardView
      key={`${jobResult.page}-${sortBy}`}
      initialJobs={jobResult.jobs}
      firstName={firstName}
      stats={stats}
      emptyHint={emptyHint}
      pagination={{
        page: jobResult.page,
        pageSize: jobResult.pageSize,
        total: jobResult.total,
        totalPages: jobResult.totalPages,
      }}
      sortBy={sortBy}
    />
  );
}
