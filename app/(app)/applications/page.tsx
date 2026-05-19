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
import { ApplicationCard } from "@/components/caliber/application-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  APPLICATIONS,
  type Application,
  type ApplicationStatus,
} from "@/lib/mock-data";
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

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(() => [...APPLICATIONS]);
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
    setApps((prev) =>
      prev.map((a) =>
        a.id === draggedId ? { ...a, status: statusFor(overId, a.status) } : a,
      ),
    );
  }

  const interviewCount = grouped.Interview.length;
  const offerCount = grouped["Offer/Closed"].filter((a) => a.status === "Offer").length;

  return (
    <div className="w-full px-8 pb-[60px] pt-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em]">
            Applications
          </h1>
          <p className="mt-1.5 text-[14px] text-text-muted">
            {apps.length} tracked · {interviewCount} in interview · {offerCount} offer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applications"
              className="h-8 w-[240px] pl-8 text-[13px]"
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
        <div
          className="mt-6 grid gap-3"
          style={{
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            minHeight: "calc(100vh - 220px)",
          }}
        >
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
      {...listeners}
      {...attributes}
      className={cn(isDragging && "opacity-30")}
    >
      <ApplicationCard application={app} />
    </div>
  );
}
