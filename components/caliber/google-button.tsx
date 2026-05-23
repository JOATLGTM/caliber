"use client";

import { Button } from "@/components/ui/button";

interface GoogleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}

export function GoogleButton({
  children,
  onClick,
  disabled,
  type = "button",
}: GoogleButtonProps) {
  return (
    <Button
      type={type}
      variant="outline"
      size="lg"
      className="w-full justify-center"
      onClick={onClick}
      disabled={disabled}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6c-.2 1.3-1 2.4-2 3.1v2.6h3.3C20.8 17.9 22 15.3 22 12.2z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H2.9v2.6C4.5 19.7 8 22 12 22z"
        />
        <path
          fill="#FBBC04"
          d="M6.4 13.9C6.2 13.3 6.1 12.7 6.1 12s.1-1.3.3-1.9V7.5H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.5l3.5-2.6z"
        />
        <path
          fill="#EA4335"
          d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8 2 4.5 4.3 2.9 7.5l3.5 2.6C7.2 7.6 9.4 5.9 12 5.9z"
        />
      </svg>
      {children}
    </Button>
  );
}
