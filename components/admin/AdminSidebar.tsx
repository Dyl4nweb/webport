"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import ThemeToggle from "@/components/ui/ThemeToggle";
import { signOut } from "@/lib/auth";

const NAV_ITEMS: { name: string; href: string }[] = [
  { name: "Dashboard", href: "/admin" },
  { name: "Inquiries", href: "/admin/inquiries" },
  { name: "Bookings", href: "/admin/bookings" },
  { name: "Analytics", href: "/admin/analytics" },
  { name: "Visitors", href: "/admin/visitors" },
  { name: "Gmail", href: "/admin/gmail" },
  { name: "Activity", href: "/admin/activity" },
  { name: "Projects", href: "/admin/projects" },
  { name: "Certificates", href: "/admin/certificates" },
  { name: "Storage", href: "/admin/storage" },
];

export default function AdminSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const lastPathname = useRef(pathname);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.replace("/admin/login");
  }

  useEffect(() => {
    if (!open || !onClose) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    const changed = lastPathname.current !== pathname;
    lastPathname.current = pathname;
    if (changed && open) onClose?.();
  }, [pathname, open, onClose]);

  useEffect(() => {
    if (!open) return;

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    document.body.style.overflow = "hidden";

    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) onClose?.();
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      document.body.style.overflow = "";
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line/60 bg-surface-card px-3 pb-5 pt-6 shadow-xl transition-[transform,visibility] duration-200 ease-out dark:border-line-dark/60 dark:bg-surface-dark-card ${
          open
            ? "visible translate-x-0"
            : "invisible -translate-x-full"
        } md:visible md:translate-x-0 md:shadow-none`}
      >
      <div className="flex items-center gap-2.5 px-2 pb-4">
        <Image
          src="/icon.png"
          alt=""
          aria-hidden
          width={28}
          height={28}
          className="h-7 w-auto rounded-[7px]"
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-ink dark:text-ink-dark">
            Dylan Ramos
          </p>
          <p className="text-[11px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
            Admin
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 border-t border-line/50 pt-3 dark:border-line-dark/50">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-9 items-center rounded-apple-sm px-3 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                active
                  ? "bg-accent/[0.08] text-accent dark:bg-accent-dark/[0.12] dark:text-accent-dark"
                  : "text-ink-secondary hover:bg-ink/[0.04] hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.06] dark:hover:text-ink-dark"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-line/50 pt-3 dark:border-line-dark/50">
        <Link
          href="/"
          className="flex h-9 items-center rounded-apple-sm px-3 text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.06] dark:hover:text-ink-dark"
        >
          Back to Site
        </Link>

        <div className="flex h-9 items-center justify-between px-3">
          <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
            Theme
          </span>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex h-9 w-full items-center rounded-apple-sm px-3 text-left text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:bg-red-500/[0.07] hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:pointer-events-none disabled:opacity-40 dark:text-ink-dark-secondary"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
      </aside>
    </>
  );
}
