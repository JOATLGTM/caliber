import { ApplicationsBoard } from "./applications-board";
import { listApplications } from "@/lib/db/applications";

export default async function ApplicationsPage() {
  const initialApps = await listApplications();
  return <ApplicationsBoard initialApps={initialApps} />;
}
