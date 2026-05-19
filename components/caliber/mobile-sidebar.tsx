"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarBody } from "./app-sidebar";

interface MobileSidebarProps {
  applicationsCount?: number;
}

export function MobileSidebar({ applicationsCount }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open navigation"
          className="h-8 w-8 md:hidden"
        >
          <Menu size={15} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[260px] p-0 sm:max-w-[260px]"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarBody
          applicationsCount={applicationsCount}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
