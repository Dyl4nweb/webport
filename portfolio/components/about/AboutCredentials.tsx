"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { certificates } from "@/data/certificates";
import { experience } from "@/data/experience";

// Top flagship certifications to highlight with spacious layout
const FEATURED_CERTS = certificates.slice(0, 4);

export default function AboutCredentials() {
  const education = experience.find((item) =>
    item.company.includes("Pangasinan State University")
  );

  return (
    <section className="relative py-14 sm:py-18 md:py-24">

      <Container className="flex flex-col gap-8 sm:gap-12 md:gap-14 px-4 sm:px-6">
        {/* Section Heading */}
        <Reveal>
          <div className="mx-auto w-full max-w-4xl text-center">
            <SectionHeading
              eyebrow="Academics & Credentials"
              title="Education & Certifications"
              deck="Academic degree, technical background, and verified industry credentials."
              align="center"
              titleClassName="md:whitespace-nowrap max-w-none"
            />
          </div>
        </Reveal>

        {/* 2-Column Spacious Grid: Education on Left, Top Certifications on Right */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
          {/* Left Column: Formal Education Card */}
          <Reveal delay={80} className="h-full">
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-surface-card/95 dark:bg-[#121214]/95 backdrop-blur-xl p-5 sm:p-7 md:p-8 shadow-[0_10px_35px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_15px_45px_-15px_rgba(0,0,0,0.15)]">
              <div>
                {/* Header Tag & Years */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-400/20 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Degree Completed
                  </span>
                  <span className="font-mono text-[11.5px] sm:text-[12px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                    2022 — 2026
                  </span>
                </div>

                {/* Degree Title */}
                <h3 className="mt-4 sm:mt-5 text-[19px] sm:text-2xl font-bold tracking-tight text-ink dark:text-ink-dark leading-snug">
                  Bachelor of Science in Information Technology
                </h3>

                {/* University Name */}
                <p className="mt-1.5 text-[13.5px] sm:text-[14.5px] font-semibold text-accent dark:text-accent-dark">
                  Pangasinan State University — Lingayen Campus
                </p>

                {/* Description */}
                <p className="mt-3.5 text-[13.5px] sm:text-[14.5px] leading-[1.7] text-ink-secondary dark:text-ink-dark-secondary">
                  {education?.summary ||
                    "Built a comprehensive foundation across full-stack web and mobile development, database architecture, network administration, and IT systems engineering."}
                </p>

                {/* Competency Pills */}
                <div className="mt-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {[
                    "Full-Stack Web & Mobile",
                    "Database Architecture",
                    "System Design",
                    "IT Operations & Networks",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-alt dark:bg-[#1a1a1d] border border-line/60 dark:border-line-dark/60 px-2.5 sm:px-3 py-1 text-[11px] sm:text-[11.5px] font-mono text-ink-secondary dark:text-ink-dark-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-6 sm:mt-8 pt-4 border-t border-line/40 dark:border-line-dark/40 flex items-center justify-between gap-2">
                <span className="text-[11.5px] sm:text-[12px] font-mono text-ink-tertiary dark:text-ink-dark-secondary flex items-center gap-1">
                  <span></span> Lingayen, Pangasinan
                </span>

                <Link
                  href="/experience"
                  className="group/link inline-flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-ink dark:text-ink-dark hover:text-accent dark:hover:text-accent-dark transition-colors"
                >
                  <span>Career timeline</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Verified Certifications Highlights */}
          <Reveal delay={140} className="h-full">
            <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-surface-card/95 dark:bg-[#121214]/95 backdrop-blur-xl p-5 sm:p-7 md:p-8 shadow-[0_10px_35px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_-20px_rgba(0,0,0,0.6)]">
              <div>
                {/* Header Tag & View All Shortcut */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt dark:bg-[#1a1a1d] border border-line/60 dark:border-line-dark/60 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-secondary dark:text-ink-dark-secondary">
                    Industry Credentials
                  </span>

                  <Link
                    href="/certifications?from=about"
                    className="text-[11.5px] sm:text-[12px] font-mono font-medium text-accent dark:text-accent-dark hover:underline transition-all"
                  >
                    View all ({certificates.length}) ↗
                  </Link>
                </div>

                {/* Section Title */}
                <h3 className="mt-4 sm:mt-5 text-[19px] sm:text-2xl font-bold tracking-tight text-ink dark:text-ink-dark leading-snug">
                  Verified Certifications
                </h3>

                {/* Certifications List */}
                <div className="mt-4 sm:mt-5 flex flex-col gap-2.5 sm:gap-3">
                  {FEATURED_CERTS.map((cert) => (
                    <div
                      key={cert.title}
                      className="group/item flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl border border-line/50 dark:border-line-dark/50 bg-surface-alt/50 dark:bg-[#18181b]/70 p-3 sm:p-3.5 transition-all duration-200 hover:border-black/20 dark:hover:border-white/20 hover:bg-surface dark:hover:bg-[#1c1c20]"
                    >
                      {/* Left: Logo & Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-xl border border-line/60 dark:border-line-dark/60 bg-white p-1 shadow-sm">
                          <Image
                            src={cert.logo}
                            alt={`${cert.issuer} logo`}
                            fill
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-[13px] sm:text-[14px] font-semibold text-ink dark:text-ink-dark truncate group-hover/item:text-accent dark:group-hover/item:text-accent-dark transition-colors">
                            {cert.title}
                          </h4>
                          <p className="font-mono text-[11px] sm:text-[11.5px] text-ink-secondary dark:text-ink-dark-secondary truncate">
                            {cert.issuer} · {cert.category}
                          </p>
                        </div>
                      </div>

                      {/* Right: Verify Action */}
                      {cert.verifyUrl && (
                        <a
                          href={cert.verifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 inline-flex items-center gap-1 rounded-full border border-line/60 dark:border-line-dark/60 bg-surface dark:bg-[#121214] px-2.5 py-1 text-[11px] font-mono font-medium text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark hover:border-black/30 dark:hover:border-white/30 active:scale-95 transition-all"
                          title="Verify Credential on Credly/Official Provider"
                          aria-label={`Verify ${cert.title}`}
                        >
                          <span className="hidden min-[400px]:inline">Verify</span>
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-6 sm:mt-8 pt-4 border-t border-line/40 dark:border-line-dark/40 flex items-center justify-between gap-2">
                <span className="text-[11.5px] sm:text-[12px] font-mono text-ink-tertiary dark:text-ink-dark-secondary truncate">
                  Cisco · DataBricks · IBM
                </span>

                <Link
                  href="/certifications?from=about"
                  className="group/link inline-flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-ink dark:text-ink-dark hover:text-accent dark:hover:text-accent-dark transition-colors shrink-0"
                >
                  <span>Explore archive</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
