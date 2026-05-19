import { Download, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MatchScoreBadge } from "@/components/caliber/match-score-badge";
import { RESUMES, shortDate } from "@/lib/mock-data";

export default function ResumesPage() {
  const base = RESUMES.find((r) => r.isBase);
  const tailored = RESUMES.filter((r) => !r.isBase);

  return (
    <div className="w-full max-w-[1200px] px-4 pb-[60px] pt-7 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[26px]">
            Resumes
          </h1>
          <p className="mt-1.5 text-[14px] text-text-muted">
            One base resume, {tailored.length} tailored versions.
          </p>
        </div>
        <Button size="sm">
          <Upload size={13} aria-hidden /> Replace base
        </Button>
      </div>

      {base && (
        <div className="mt-7 rounded-lg border border-border bg-background p-[22px]">
          <div className="flex items-start gap-3">
            <div className="grid h-[72px] w-14 flex-shrink-0 place-items-center rounded-md border border-border bg-bg-elev">
              <FileText size={20} aria-hidden className="text-text-faint" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
                  {base.title}
                </h2>
                <span className="inline-flex h-[22px] items-center rounded-[4px] border border-border bg-bg-elev-2 px-2 text-[11.5px] font-medium">
                  Base
                </span>
              </div>
              <div className="mt-1 text-[13px] text-text-muted">
                Last updated {shortDate(base.updatedAt)} · PDF · 2 pages · 142 KB
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Replace file
                </Button>
                <Button variant="ghost" size="sm">
                  View JSON
                </Button>
                <Button variant="ghost" size="sm">
                  <Download size={13} aria-hidden /> Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-3.5 mt-8 font-display text-[18px] font-semibold tracking-[-0.018em]">
        Tailored versions ({tailored.length})
      </h2>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job title</TableHead>
              <TableHead className="hidden sm:table-cell">Company</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden sm:table-cell">Match</TableHead>
              <TableHead className="w-[100px] text-right md:w-[140px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tailored.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-text">
                  <div>{r.jobTitle}</div>
                  <div className="mt-0.5 text-[12px] font-normal text-text-muted sm:hidden">
                    {r.company} · {shortDate(r.updatedAt)}
                    {r.matchScoreAtTime != null && (
                      <> · {r.matchScoreAtTime}% match</>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden text-text-muted sm:table-cell">
                  {r.company}
                </TableCell>
                <TableCell className="hidden text-text-muted md:table-cell">
                  {shortDate(r.updatedAt)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {r.matchScoreAtTime != null && (
                    <MatchScoreBadge
                      score={r.matchScoreAtTime}
                      treatment="quiet"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Download ${r.title}`}
                    >
                      <Download size={13} aria-hidden />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
