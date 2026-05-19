import { Download, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/caliber/empty-state";
import { COVER_LETTERS, shortDate } from "@/lib/mock-data";

export default function CoverLettersPage() {
  return (
    <div className="w-full max-w-[1200px] px-4 pb-[60px] pt-7 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[26px]">
            Cover letters
          </h1>
          <p className="mt-1.5 text-[14px] text-text-muted">
            {COVER_LETTERS.length} generated letters.
          </p>
        </div>
        <Button size="sm">
          <Plus size={13} aria-hidden /> New from job
        </Button>
      </div>

      {COVER_LETTERS.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-background">
          <EmptyState
            icon={Mail}
            title="No cover letters yet"
            description="Generate your first letter from a job you're interested in."
            action={
              <Button size="sm">
                <Plus size={13} aria-hidden /> New from job
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {COVER_LETTERS.map((c) => (
            <article
              key={c.id}
              className="rounded-lg border border-border bg-background p-[18px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] text-text-faint">{c.company}</div>
                  <h3 className="mt-0.5 line-clamp-2 font-display text-[15px] font-semibold leading-tight tracking-[-0.018em]">
                    {c.jobTitle}
                  </h3>
                </div>
                <span className="flex-shrink-0 text-[11.5px] text-text-faint">
                  {shortDate(c.createdAt)}
                </span>
              </div>
              <p className="mt-2.5 line-clamp-4 text-[13px] leading-[1.55] text-text-muted">
                {c.preview}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <Button variant="outline" size="sm">
                  View
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Download cover letter for ${c.company}`}
                >
                  <Download size={13} aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-bad hover:text-bad"
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
