"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function ToastProvider() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme === "light" ? "light" : "dark"}
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-background text-text font-sans text-[13px] shadow-md",
          description: "text-text-muted",
        },
      }}
    />
  );
}
