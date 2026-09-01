"use client";

import MacDock from "@/components/ui/MacDock";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <header
      className={cn(
        "fixed bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50",
        "transition-all duration-300 ease-out",
        "pb-[env(safe-area-inset-bottom,0px)]"
      )}
    >
      <MacDock />
    </header>
  );
}