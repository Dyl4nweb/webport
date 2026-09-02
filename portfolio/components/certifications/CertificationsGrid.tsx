"use client";

import { useState, useMemo } from "react";
import CertificateCard from "@/components/sections/CertificateCard";
import Reveal from "@/components/ui/Reveal";
import type { Certificate } from "@/data/certificates";
import { cn } from "@/lib/utils";

interface CertificationsGridProps {
  certificates: Certificate[];
}

export default function CertificationsGrid({
  certificates,
}: CertificationsGridProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(certificates.map((c) => c.category)))];
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();

    return certificates.filter((cert) => {
      const matchCategory =
        activeCategory === "All" ||
        (cert.category && cert.category.toLowerCase() === activeCategory.toLowerCase());

      if (!matchCategory) return false;

      if (!cleanQuery) return true;

      const titleMatch = cert.title?.toLowerCase().includes(cleanQuery);
      const issuerMatch = cert.issuer?.toLowerCase().includes(cleanQuery);
      const categoryMatch = cert.category?.toLowerCase().includes(cleanQuery);
      const descMatch = cert.description?.toLowerCase().includes(cleanQuery);
      const yearMatch = cert.year ? String(cert.year).toLowerCase().includes(cleanQuery) : false;

      return Boolean(titleMatch || issuerMatch || categoryMatch || descMatch || yearMatch);
    });
  }, [certificates, query, activeCategory]);

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Search Input Bar & Category Filters */}
      <Reveal>
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Search Bar */}
          <div className="relative mx-auto w-full max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-tertiary dark:text-ink-dark-secondary">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search certificates by title, issuer (Cisco, DataBricks, IBM...), or year..."
              className={cn(
                "w-full rounded-2xl sm:rounded-full bg-surface-card dark:bg-surface-dark-card border border-line/70 dark:border-line-dark/70 py-3.5 pl-11 pr-10 text-[14px] sm:text-[15px] text-ink dark:text-ink-dark shadow-sm backdrop-blur-md transition-all placeholder:text-ink-tertiary focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10 dark:focus:border-white dark:focus:ring-white/10"
              )}
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-tertiary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Tabs & Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat;
                const count =
                  cat === "All"
                    ? certificates.length
                    : certificates.filter((c) => c.category === cat).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[12px] sm:text-[12.5px] font-mono font-medium transition-all select-none border",
                      isSelected
                        ? "bg-ink text-surface dark:bg-ink-dark dark:text-surface-dark border-ink dark:border-ink-dark shadow-sm"
                        : "bg-surface-card dark:bg-surface-dark-card border-line/60 dark:border-line-dark/60 text-ink-secondary dark:text-ink-dark-secondary hover:border-black/30 dark:hover:border-white/30 hover:text-ink dark:hover:text-ink-dark"
                    )}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            <span className="font-mono text-[11.5px] text-ink-tertiary dark:text-ink-dark-secondary">
              Showing {filteredCertificates.length} of {certificates.length} credentials
            </span>
          </div>
        </div>
      </Reveal>

      {/* Grid of Results */}
      {filteredCertificates.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCertificates.map((certificate, index) => (
            <Reveal
              key={`${certificate.title}-${certificate.issuer}`}
              delay={index * 45}
            >
              <CertificateCard certificate={certificate} index={index} />
            </Reveal>
          ))}
        </div>
      ) : (
        /* Empty Search State */
        <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-line/60 dark:border-line-dark/60 bg-surface-card/60 dark:bg-surface-dark-card/60 p-10 text-center backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt dark:bg-[#18181b] text-ink-secondary dark:text-ink-dark-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-ink dark:text-ink-dark">
            No certificates found
          </h3>
          <p className="mt-1.5 text-xs text-ink-secondary dark:text-ink-dark-secondary">
            We couldn&apos;t find any certificate matching &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory("All");
            }}
            className="mt-5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-surface hover:opacity-90 dark:bg-ink-dark dark:text-surface-dark"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
