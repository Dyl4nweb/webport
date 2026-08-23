"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAdminSession } from "@/lib/auth";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, loading } = useAdminSession();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/admin/login");
  }, [loading, session, router]);

  // While the session is being resolved, render a quiet blank screen —
  // prevents both a flash of dashboard and a flash of login.
  if (loading || !session) {
    return <div className="min-h-screen bg-surface dark:bg-surface-dark" />;
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <main className="md:pl-60">
        <div className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-line/60 bg-surface px-4 dark:border-line-dark/60 dark:bg-surface-dark md:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open admin menu"
            aria-expanded={navOpen}
            aria-controls="admin-sidebar"
            className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-apple-sm text-ink-secondary transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-ink-dark-secondary dark:hover:bg-ink-dark/[0.08] dark:hover:text-ink-dark"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M3 5.5h14M3 10h14M3 14.5h14" />
            </svg>
          </button>

          <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink dark:text-ink-dark">
            Admin
          </span>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
