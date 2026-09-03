"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import GlitchText from "@/components/ui/GlitchText";
import { SITE } from "@/lib/constants";
import ContactForm from "@/app/contact/ContactForm";

export default function Contact() {
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
    <section className="relative pt-14 pb-20 sm:pt-16 sm:pb-28 md:pt-20 md:pb-32">
      <Container>
        {/* Header content */}
        <div className="flex flex-col items-center text-center">
          {/* Availability Status (Minimalist, cohesive layout) */}
          <Reveal>
            <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 select-none text-center">
              <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="contact-status-pulse absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="contact-status-dot relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-semibold uppercase tracking-[0.08em] sm:tracking-[0.14em] text-[10px] min-[360px]:text-[10.5px] sm:text-[11.5px] text-ink dark:text-ink-dark">
                  AVAILABLE FOR NEW OPPORTUNITIES
                </span>
              </div>
              <span className="text-ink-tertiary dark:text-ink-dark-secondary text-[10px]">·</span>
              <span className="text-[10.5px] sm:text-[12px] text-ink-secondary dark:text-ink-dark-secondary font-medium whitespace-nowrap">
                Manila (UTC+8)
              </span>
            </div>
          </Reveal>

          {/* Main Headline matching Hero style */}
          <Reveal delay={60}>
            <h2 className="mt-3.5 sm:mt-4 max-w-4xl lg:max-w-5xl text-balance text-2xl min-[360px]:text-[26px] sm:text-4xl md:text-5xl lg:text-[54px] xl:text-6xl font-bold tracking-[-0.03em] sm:tracking-[-0.05em] text-ink dark:text-ink-dark leading-[1.18] sm:leading-[1.1] text-center xl:whitespace-nowrap">
              <GlitchText text="Have a project in mind? Let's build it." />
            </h2>
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
    </section>
  );
}