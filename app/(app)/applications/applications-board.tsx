"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Download, Filter, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ApplicationCard } from "@/components/caliber/application-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateApplicationStatusAction } from "@/lib/actions/applications";
import type { Application, ApplicationStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ColumnId =
  | "Saved"
  | "Applied"
  | "Phone Screen"
  | "Interview"
  | "Offer/Closed";

const COLUMNS: ColumnId[] = [
  "Saved",
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer/Closed",
];

function columnFor(status: ApplicationStatus): ColumnId {
  if (status === "Offer" || status === "Closed") return "Offer/Closed";
  return status;
}

function statusFor(column: ColumnId, current: ApplicationStatus): ApplicationStatus {
  if (column === "Offer/Closed") {
    return current === "Offer" || current === "Closed" ? current : "Offer";
  }
  return column;
}

interface ApplicationsBoardProps {
  initialApps: Application[];
}

export function ApplicationsBoard({ initialApps }: ApplicationsBoardProps) {
  const [apps, setApps] = useState<Application[]>(() => [...initialApps]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q),
    );
  }, [apps, query]);

  const grouped = useMemo(() => {
    const g: Record<ColumnId, Application[]> = {
      Saved: [],
      Applied: [],
      "Phone Screen": [],
      Interview: [],
      "Offer/Closed": [],
    };
    for (const a of filtered) g[columnFor(a.status)].push(a);
    return g;
  }, [filtered]);

  const activeApp = activeId ? apps.find((a) => a.id === activeId) ?? null : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const overId = e.over?.id as ColumnId | undefined;
    if (!overId) return;
    const draggedId = String(e.active.id);
    const app = apps.find((a) => a.id === draggedId);
    if (!app) return;
    const nextStatus = statusFor(overId, app.status);
    if (nextStatus === app.status) return;

    const prevStatus = app.status;
    setApps((prev) =>
      prev.map((a) =>
        a.id === draggedId ? { ...a, status: nextStatus } : a,
      ),
    );
    void updateApplicationStatusAction(draggedId, nextStatus).then((res) => {
      if (!res.ok) {
        toast.error("Couldn't update application");
        setApps((prev) =>
          prev.map((a) =>
            a.id === draggedId ? { ...a, status: prevStatus } : a,
          ),
        );
      } else {
        toast.success(`Moved to ${nextStatus}`);
      }
    });
  }

  const interviewCount = grouped.Interview.length;
  const offerCount = grouped["Offer/Closed"].filter((a) => a.status === "Offer").length;

  return (
    <div className="w-full px-4 pb-[60px] pt-7 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[26px]">
            Applications
          </h1>
          <p className="mt-1.5 text-[14px] text-text-muted">
            {apps.length} tracked · {interviewCount} in interview · {offerCount} offer
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search
              size={13}
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applications"
              className="h-8 w-full pl-8 text-[13px] sm:w-[240px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter size={13} aria-hidden /> Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download size={13} aria-hidden /> Export CSV
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:min-h-[calc(100vh_-_220px)]">
          {COLUMNS.map((col) => (
            <Column key={col} id={col} count={grouped[col].length}>
              {grouped[col].map((a) => (
                <DraggableCard key={a.id} app={a} />
              ))}
              {grouped[col].length === 0 && (
                <div className="px-2 py-5 text-center text-[12px] text-text-faint">
                  No applications
                </div>
              )}
            </Column>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeApp ? (
            <div className="rotate-[1.5deg] shadow-[var(--shadow-token-md)]">
              <ApplicationCard application={activeApp} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({
  id,
  count,
  children,
}: {
  id: ColumnId;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-bg-elev transition-colors",
        isOver && "border-border-strong bg-bg-elev-2",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
        <span className="text-[12.5px] font-medium text-text">{id}</span>
        <span className="rounded-full border border-border bg-background px-1.5 text-[11px] tabular-nums text-text-muted">
          {count}
        </span>
        <button
          type="button"
          className="ml-auto grid h-[22px] w-[22px] place-items-center rounded-[4px] text-text-faint transition-colors hover:bg-bg-elev-2 hover:text-text"
          aria-label={`Add to ${id}`}
        >
          <Plus size={12} aria-hidden />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2.5">
        {children}
      </div>
    </div>
  );
}

function DraggableCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: app.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(isDragging && "opacity-30")}
    >
      <ApplicationCard
        application={app}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  );
}
