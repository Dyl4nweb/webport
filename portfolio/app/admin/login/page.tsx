"use client";

import { useEffect, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { signIn, useAdminSession } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, loading } = useAdminSession();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → straight to the dashboard
  useEffect(() => {
    if (!loading && session) {
      router.replace("/admin");
    }
  }, [loading, session, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const errorMessage = await signIn(email, password);

    if (errorMessage) {
      setError(errorMessage);
      setSubmitting(false);
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_just_logged_in", "1");
      sessionStorage.removeItem("varex_briefing_dismissed_at");
      sessionStorage.removeItem("varex_briefing_session_seen");
    }

    router.replace("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-16 dark:bg-surface-dark">
      <div className="w-full max-w-[400px] rounded-apple-lg border border-line/70 bg-surface-card p-6 sm:p-8 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.3)] dark:border-line-dark/70 dark:bg-surface-dark-card">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
          Admin
        </span>

        <h1 className="mt-3 text-[24px] sm:text-[26px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark">
          Sign in
        </h1>

        <p className="mt-2 text-[13.5px] sm:text-[14px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          Private access — authorized account only.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 sm:mt-8 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
              Email
            </span>

            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              disabled={submitting}
              className="rounded-apple-sm border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60 dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-accent-dark"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
              Password
            </span>

            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={submitting}
              className="rounded-apple-sm border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60 dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-accent-dark"
            />
          </label>

          {error && (
            <span className="text-[14px] text-red-500" role="alert">
              {error}
            </span>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="self-start inline-flex min-w-[120px] items-center justify-center rounded-full bg-ink px-5 py-2.5 sm:px-6 sm:py-3 text-[13.5px] sm:text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_-18px_rgba(0,0,0,0.45)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none dark:bg-white dark:text-black"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
