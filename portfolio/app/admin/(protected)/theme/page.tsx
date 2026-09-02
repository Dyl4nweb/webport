"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { SITE_THEMES, THEME_STORAGE_KEY, isValidTheme, type SiteTheme } from "@/lib/theme";
import { applySiteThemeToDOM } from "@/components/theme/ThemeProvider";

export default function AdminThemePage() {
  const [activeGlobalTheme, setActiveGlobalTheme] = useState<SiteTheme>("modern");
  const [selectedTheme, setSelectedTheme] = useState<SiteTheme>("modern");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchTheme() {
      try {
        const res = await fetch("/api/admin/theme");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && isValidTheme(data.theme)) {
            setActiveGlobalTheme(data.theme);
            setSelectedTheme(data.theme);
          }
        }
      } catch (err) {
        console.error("Failed to fetch theme:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTheme();
  }, []);

  const [sqlCopied, setSqlCopied] = useState(false);
  const [missingTable, setMissingTable] = useState(false);

  const MIGRATION_SQL = `-- 009_site_theme_settings.sql
create table if not exists public.site_settings (
  id text primary key default 'global',
  active_theme text not null default 'modern'
    check (active_theme in ('modern', 'cafe', 'cyber')),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Anyone can read site_settings" on public.site_settings;
create policy "Anyone can read site_settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Admins can update site_settings" on public.site_settings;
create policy "Admins can update site_settings"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can insert site_settings" on public.site_settings;
create policy "Admins can insert site_settings"
  on public.site_settings for insert
  with check (public.is_admin());

insert into public.site_settings (id, active_theme)
values ('global', 'modern')
on conflict (id) do nothing;`;

  function handleCopySQL() {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  }

  // Quick Live Preview locally
  function handleLivePreview(theme: SiteTheme) {
    setSelectedTheme(theme);
    applySiteThemeToDOM(theme);
    window.dispatchEvent(new CustomEvent("site-theme:change", { detail: { theme } }));
  }

  // Publish global theme to Supabase
  async function handlePublishTheme() {
    setSaving(true);
    setMessage(null);
    setMissingTable(false);

    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active admin session found. Please log in to your admin account again.");
      }

      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ theme: selectedTheme }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(data.message || "Your admin session has expired or lacks permissions. Please log in again.");
        }
        if (data.message?.includes("site_settings") || data.db_error?.includes("site_settings")) {
          setMissingTable(true);
        }
        throw new Error(data.message || data.db_error || "Failed to update global theme");
      }

      if (data.db_synced === false) {
        setMissingTable(true);
      }

      setActiveGlobalTheme(selectedTheme);
      applySiteThemeToDOM(selectedTheme);
      setMessage({
        type: "success",
        text: `Successfully published ${SITE_THEMES[selectedTheme].name} as the live global theme!${data.db_synced === false ? " (Note: Run the SQL script below in Supabase to sync to the database)" : ""}`,
      });
    } catch (err: any) {
      console.error("Publish error:", err);
      const isDbMissing = err?.message?.includes("site_settings") || err?.message?.includes("schema cache");
      if (isDbMissing) {
        setMissingTable(true);
      }
      setMessage({
        type: "error",
        text: isDbMissing
          ? "The 'site_settings' table is not in your Supabase database yet. Please click 'Copy SQL Script' below and run it in Supabase SQL Editor."
          : err?.message || "Failed to publish theme",
      });
    } finally {
      setSaving(false);
    }
  }

  const currentConfig = SITE_THEMES[selectedTheme];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-accent dark:text-accent-dark">
            Theme Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark mt-1">
            Site Aesthetic & Themes
          </h1>
          <p className="text-[13px] sm:text-[14px] text-ink-secondary dark:text-ink-dark-secondary mt-0.5">
            Switch the visual vibe of your public portfolio across Modern Minimalist, Coffee Shop Aesthetic, and Cyber Terminal.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-surface-card dark:bg-surface-dark-card border border-line/70 dark:border-line-dark/70 px-4 py-2 text-[12px] font-medium text-ink dark:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors shadow-sm"
        >
          <span>View Public Site</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>
      </div>

      {/* Active Status Ribbon */}
      <div className="rounded-2xl border border-line/70 dark:border-line-dark/70 bg-surface-card dark:bg-surface-dark-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="text-[12px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
              Live Global Theme
            </p>
            <p className="text-base font-bold text-ink dark:text-ink-dark">
              {loading ? "Loading..." : SITE_THEMES[activeGlobalTheme]?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedTheme !== activeGlobalTheme && (
            <span className="text-[11.5px] font-medium text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full bg-amber-500/10">
              Unpublished changes in preview
            </span>
          )}

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-surface-alt px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-black/[0.06] dark:border-line-dark/80 dark:bg-surface-dark-alt dark:text-ink-dark dark:hover:bg-white/[0.08]"
          >
            <span>View Website</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={handlePublishTheme}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all hover:bg-accent-hover hover:shadow disabled:opacity-50 dark:bg-accent-dark dark:text-black dark:hover:bg-accent-dark-hover"
          >
            {saving ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span>Publish Theme</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-[13px] font-medium border flex items-center justify-between gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{message.text}</span>
            {message.type === "success" && (
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold hover:opacity-80"
              >
                Open live site ↗
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Missing Database Table Quick Setup Guide */}
      {missingTable && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">
                ⚡ 1-Step Database Setup Required
              </h4>
              <p className="text-xs text-ink-secondary dark:text-ink-dark-secondary mt-0.5">
                Paste and run this SQL script in your <strong>Supabase Dashboard → SQL Editor</strong> to create the <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">site_settings</code> table.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySQL}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-amber-600 text-white hover:bg-amber-700 px-4 py-1.5 text-xs font-semibold transition-all shadow-sm"
            >
              {sqlCopied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>

          <pre className="rounded-xl bg-black/90 dark:bg-black/60 p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
            {MIGRATION_SQL}
          </pre>
        </div>
      )}

      {/* 3 Theme Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {(Object.keys(SITE_THEMES) as SiteTheme[]).map((themeKey) => {
          const cfg = SITE_THEMES[themeKey];
          const isSelected = selectedTheme === themeKey;
          const isLive = activeGlobalTheme === themeKey;

          return (
            <div
              key={themeKey}
              onClick={() => handleLivePreview(themeKey)}
              className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border p-5 sm:p-6 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "border-ink dark:border-white ring-2 ring-ink/20 dark:ring-white/20 bg-surface-card dark:bg-surface-dark-card shadow-lg scale-[1.01]"
                  : "border-line/70 dark:border-line-dark/70 bg-surface-card/60 dark:bg-surface-dark-card/60 hover:border-line-dark/40 dark:hover:border-line/40 hover:bg-surface-card dark:hover:bg-surface-dark-card"
              }`}
            >
              <div>
                {/* Header Strip & Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      themeKey === "cyber"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : themeKey === "cafe"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        : "bg-black/10 dark:bg-white/10 text-ink dark:text-ink-dark"
                    }`}
                  >
                    {cfg.badge}
                  </span>

                  {isLive && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      LIVE
                    </span>
                  )}
                </div>

                {/* Theme Name */}
                <h3 className="text-lg font-bold text-ink dark:text-ink-dark">
                  {cfg.name}
                </h3>
                <p className="text-[11.5px] font-medium text-ink-secondary dark:text-ink-dark-secondary mb-3">
                  {cfg.subtitle}
                </p>

                {/* Visual Snapshot Preview Box */}
                <div
                  className="rounded-xl p-3.5 mb-4 border transition-transform duration-200 group-hover:scale-[1.02]"
                  style={{
                    backgroundColor: cfg.colors.surface,
                    borderColor: cfg.colors.primary + "33",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: cfg.colors.accent }}
                      />
                      <span
                        className="text-[11px] font-bold tracking-tight"
                        style={{ color: cfg.colors.ink }}
                      >
                        Dylan Ramos
                      </span>
                    </div>
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: cfg.colors.accent + "20",
                        color: cfg.colors.accent,
                      }}
                    >
                      {themeKey === "cyber" ? "0101_ONLINE" : "PORTFOLIO"}
                    </span>
                  </div>

                  <div
                    className="rounded-lg p-2.5 border text-[11px] leading-relaxed"
                    style={{
                      backgroundColor: cfg.colors.card,
                      borderColor: cfg.colors.primary + "20",
                      color: cfg.colors.ink,
                    }}
                  >
                    {themeKey === "cyber"
                      ? "> SYSTEM READY: Emerald Matrix Console initialized."
                      : themeKey === "cafe"
                      ? "Warm espresso vibes & cozy artisan typography."
                      : "Sleek Apple-style monochrome and clean minimalism."}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[12px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary mb-4">
                  {cfg.description}
                </p>

                {/* Features list */}
                <ul className="space-y-1.5 text-[11px] text-ink-secondary dark:text-ink-dark-secondary mb-5">
                  {cfg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent dark:text-accent-dark shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom selection button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLivePreview(themeKey);
                }}
                className={`w-full py-2 px-3 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-ink text-white dark:bg-white dark:text-black shadow-sm"
                    : "bg-surface-alt dark:bg-surface-dark-alt text-ink dark:text-ink-dark hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                {isSelected ? "Previewing Active" : "Preview Theme"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Theme Detail & Palette Breakdown */}
      <div className="rounded-2xl sm:rounded-3xl border border-line/70 dark:border-line-dark/70 bg-surface-card dark:bg-surface-dark-card p-5 sm:p-7">
        <h3 className="text-base sm:text-lg font-bold text-ink dark:text-ink-dark mb-1">
          Active Palette Breakdown: {currentConfig.name}
        </h3>
        <p className="text-[12px] sm:text-[13px] text-ink-secondary dark:text-ink-dark-secondary mb-5">
          These color tokens automatically adapt throughout all components and pages on light and dark mode.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-line/60 dark:border-line-dark/60 p-3 bg-surface-alt dark:bg-surface-dark-alt">
            <span className="text-[10px] font-mono uppercase text-ink-secondary dark:text-ink-dark-secondary">Light Surface</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: currentConfig.colors.surface }} />
              <span className="text-[11.5px] font-mono font-medium text-ink dark:text-ink-dark">{currentConfig.colors.surface}</span>
            </div>
          </div>

          <div className="rounded-xl border border-line/60 dark:border-line-dark/60 p-3 bg-surface-alt dark:bg-surface-dark-alt">
            <span className="text-[10px] font-mono uppercase text-ink-secondary dark:text-ink-dark-secondary">Dark Surface</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: currentConfig.colors.darkSurface }} />
              <span className="text-[11.5px] font-mono font-medium text-ink dark:text-ink-dark">{currentConfig.colors.darkSurface}</span>
            </div>
          </div>

          <div className="rounded-xl border border-line/60 dark:border-line-dark/60 p-3 bg-surface-alt dark:bg-surface-dark-alt">
            <span className="text-[10px] font-mono uppercase text-ink-secondary dark:text-ink-dark-secondary">Accent / Highlights</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: currentConfig.colors.accent }} />
              <span className="text-[11.5px] font-mono font-medium text-ink dark:text-ink-dark">{currentConfig.colors.accent}</span>
            </div>
          </div>

          <div className="rounded-xl border border-line/60 dark:border-line-dark/60 p-3 bg-surface-alt dark:bg-surface-dark-alt">
            <span className="text-[10px] font-mono uppercase text-ink-secondary dark:text-ink-dark-secondary">Atmosphere FX</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11.5px] font-semibold text-ink dark:text-ink-dark">
                {selectedTheme === "cyber" ? "Matrix Binary Stream" : selectedTheme === "cafe" ? "Warm Cozy Lighting" : "Minimalist Monochrome"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
