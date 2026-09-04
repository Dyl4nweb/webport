"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import GlitchText from "@/components/ui/GlitchText";
import { SITE } from "@/lib/constants";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(SITE.email)}` +
    `&su=${encodeURIComponent("Job Inquiry / Collaboration — Dylan Ramos")}`;

  const calUrl = "https://cal.com/dylanweb444";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SITE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen pb-24 pt-8 sm:pt-12 md:pb-32 md:pt-14">
      <Container>
        {/* Back to home Link matching other pages */}
        <Reveal>
          <div className="mb-6 sm:mb-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary transition-all hover:bg-black/[0.06] hover:text-ink dark:bg-surface-dark-alt dark:text-ink-dark-secondary dark:hover:bg-white/[0.08] dark:hover:text-ink-dark"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Back to home</span>
            </Link>
          </div>
        </Reveal>

        {/* Header content */}
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow matching Projects, Experience, and Certifications pages */}
          <Reveal delay={80}>
            <span className="font-mono text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-accent dark:text-accent-dark">
              Contact
            </span>
          </Reveal>

          {/* Main Headline matching other pages (Projects, Experience) */}
          <Reveal delay={120}>
            <h1 className="mt-4 max-w-5xl text-[26px] min-[360px]:text-[28px] min-[390px]:text-[32px] sm:text-5xl md:text-[48px] lg:text-[56px] xl:text-6xl font-bold tracking-[-0.03em] sm:tracking-[-0.05em] text-ink dark:text-ink-dark leading-[1.2] sm:leading-[1.08] text-center md:whitespace-nowrap">
              <span className="block sm:inline whitespace-nowrap">
                <GlitchText text="Let's build something" />
              </span>{" "}
              <span className="block sm:inline whitespace-nowrap">
                <GlitchText text="exceptional." delay={100} />
              </span>
            </h1>
          </Reveal>

          {/* Punchy, Clean Subhead */}
          <Reveal delay={180}>
            <p className="mt-5 max-w-xl text-balance text-[16px] sm:text-[17px] md:text-[19px] leading-[1.75] text-ink-secondary dark:text-ink-dark-secondary">
              Open for full-time engineering roles, freelance builds, and technical consultations.
            </p>
          </Reveal>
        </div>

        {/* 2-Column Action Grid */}
        <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-7 lg:gap-10 items-stretch max-w-md sm:max-w-xl lg:max-w-none mx-auto w-full">
          {/* Left Column: Direct Action Hub (5 cols) */}
          <Reveal delay={180} className="lg:col-span-5 h-full">
            <div className="flex flex-col gap-3.5 sm:gap-6 h-full">
              {/* Quick Discovery Call Card */}
              <div className="flex-1 rounded-[18px] sm:rounded-[24px] border border-line/70 bg-surface-card p-4 sm:p-6 md:p-7 shadow-sm dark:border-line-dark/70 dark:bg-surface-dark-card flex flex-col justify-between gap-3.5 sm:gap-5">
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-surface-alt dark:bg-surface-dark-alt border border-line/60 dark:border-line-dark/60 text-ink dark:text-ink-dark">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[14px] sm:text-base font-bold text-ink dark:text-ink-dark">
                        Quick Discovery Call
                      </h3>
                      <p className="text-[10.5px] sm:text-xs text-ink-secondary dark:text-ink-dark-secondary">
                        15–30 min sync via Cal.com
                      </p>
                    </div>
                  </div>

                  <p className="text-[12px] sm:text-[13.5px] leading-normal sm:leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                    Discuss your product roadmap, engineering requirements, or open roles directly on a call.
                  </p>
                </div>

                <a
                  href={calUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto self-start w-fit inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-ink px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black"
                >
                  <span>Book a call</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[15px] sm:h-[15px]">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>

              {/* Direct Email Card */}
              <div className="flex-1 rounded-[18px] sm:rounded-[24px] border border-line/70 bg-surface-card p-4 sm:p-6 md:p-7 shadow-sm dark:border-line-dark/70 dark:bg-surface-dark-card flex flex-col justify-between gap-3.5 sm:gap-5">
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary dark:text-ink-dark-secondary">
                      Direct Email
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-ink-secondary dark:text-ink-dark-secondary">
                      {SITE.location}
                    </span>
                  </div>

                  <p className="font-mono text-[12.5px] min-[360px]:text-[13px] sm:text-base font-medium text-ink dark:text-ink-dark select-all">
                    {SITE.email}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-0.5 sm:pt-1">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="w-fit inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-line/80 bg-surface-alt px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11.5px] sm:text-[12.5px] font-medium text-ink transition-colors hover:bg-black/[0.06] dark:border-line-dark/80 dark:bg-surface-dark-alt dark:text-ink-dark dark:hover:bg-white/[0.08]"
                  >
                    {copied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copy email</span>
                      </>
                    )}
                  </button>

                  <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-line/80 bg-surface-alt p-1.5 sm:p-2.5 text-ink transition-colors hover:bg-black/[0.06] dark:border-line-dark/80 dark:bg-surface-dark-alt dark:text-ink-dark dark:hover:bg-white/[0.08]"
                    title="Open in Gmail"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[16px] sm:h-[16px]">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Send Message Form (7 cols) */}
          <Reveal delay={220} className="lg:col-span-7 h-full">
            <div className="rounded-[18px] sm:rounded-[24px] border border-line/70 bg-surface-card p-4 sm:p-7 md:p-9 shadow-sm dark:border-line-dark/70 dark:bg-surface-dark-card h-full flex flex-col justify-between">
              <div>
                <div className="mb-3.5 sm:mb-6 flex flex-col gap-0.5 sm:gap-1">
                  <h3 className="text-base sm:text-xl font-bold text-ink dark:text-ink-dark">
                    Send a message
                  </h3>
                  <p className="text-[11.5px] sm:text-sm text-ink-secondary dark:text-ink-dark-secondary">
                    Drop a brief summary of your project or role. I respond within 24 hours.
                  </p>
                </div>

                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </main>
  );
}