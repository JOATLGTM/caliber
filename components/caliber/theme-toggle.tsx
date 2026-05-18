"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-8 w-8"
    >
      <Sun
        size={15}
        className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        aria-hidden
      />
      <Moon
        size={15}
        className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        aria-hidden
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
