"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface SalarySliderProps {
  /** Initial value in $k (e.g. 180 = $180k). Defaults to 180. */
  defaultValue?: number;
  /** Min value in $k. Defaults to 50. */
  min?: number;
  /** Max value in $k. Defaults to 400. */
  max?: number;
  /** Step in $k. Defaults to 5. */
  step?: number;
  /** Optional caption to the right of the value. Defaults to "min annual base". */
  caption?: string;
  /** Called whenever the value changes. */
  onChange?: (valueInThousands: number) => void;
}

export function SalarySlider({
  defaultValue = 180,
  min = 50,
  max = 400,
  step = 5,
  caption = "min annual base",
  onChange,
}: SalarySliderProps) {
  const [value, setValue] = useState(defaultValue);

  function handleChange(values: number[]) {
    const v = values[0];
    setValue(v);
    onChange?.(v);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-[22px] font-semibold tabular-nums tracking-[-0.02em]">
          ${value}k
        </span>
        <span className="text-[12px] text-text-faint">{caption}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleChange}
      />
      <div className="flex justify-between text-[11px] text-text-faint">
        <span>${min}k</span>
        <span>${max}k+</span>
      </div>
    </div>
  );
}
