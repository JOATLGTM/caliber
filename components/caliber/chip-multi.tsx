"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipMultiProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ChipMulti({
  values,
  onChange,
  placeholder,
  className,
}: ChipMultiProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  }

  function remove(v: string) {
    onChange(values.filter((x) => x !== v));
  }

  return (
    <div
      className={cn(
        "flex min-h-[42px] flex-wrap gap-1.5 rounded-md border border-border bg-background p-2",
        className,
      )}
    >
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-bg-elev-2 px-[7px] py-0.5 text-[12px]"
        >
          {v}
          <button
            type="button"
            aria-label={`Remove ${v}`}
            onClick={() => remove(v)}
            className="text-text-faint transition-colors hover:text-text"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && values.length) {
            remove(values[values.length - 1]);
          }
        }}
        placeholder={placeholder}
        className="min-w-[100px] flex-1 border-none bg-transparent text-[13px] text-text outline-none placeholder:text-text-faint"
      />
    </div>
  );
}
