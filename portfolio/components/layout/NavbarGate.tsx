"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import MacMenuBar from "@/components/ui/MacMenuBar";

export default function NavbarGate() {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <>
      {/* Global Screen Brightness / Dim Overlay managed by Control Center */}
      <div
        id="mac-brightness-overlay"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9990] bg-black opacity-0 transition-opacity duration-100 will-change-[opacity]"
      />
      <MacMenuBar />
      <Navbar />
    </>
  );
}
