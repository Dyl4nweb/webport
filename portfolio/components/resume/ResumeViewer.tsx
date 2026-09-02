"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { SITE } from "@/lib/constants";

export default function ResumeViewer() {
  const resumeUrl = "/resume/resume.pdf";
  const [viewMode, setViewMode] = useState<"digital" | "pdf">("digital");
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = useCallback(async () => {
    try {
      setDownloading(true);
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "Dylan_Ramos_Resume.pdf";
      // Hide the link so it doesn't steal focus (which causes cursor to disappear)
      link.style.display = "none";
      link.setAttribute("aria-hidden", "true");
      link.setAttribute("tabindex", "-1");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      // Restore focus to body so the cursor stays visible
      document.body.focus();

      setDownloadSuccess(true);
    } catch (err) {
      // Fallback to standard anchor download if fetch fails
      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = "Dylan_Ramos_Resume.pdf";
      link.target = "_blank";
      link.style.display = "none";
      link.setAttribute("aria-hidden", "true");
      link.setAttribute("tabindex", "-1");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Restore focus to body so the cursor stays visible
      document.body.focus();
      setDownloadSuccess(true);
    } finally {
      setDownloading(false);
    }
  }, [resumeUrl]);

  return (
    <div className="relative min-h-screen pb-28 pt-8 sm:pt-12 md:pt-14">
      {/* Ambient decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[450px] w-full max-w-5xl -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-b from-accent/[0.06] via-transparent to-transparent blur-2xl md:blur-3xl dark:from-accent-dark/[0.05]"
      />

      {/* In-page Header: Back to Home & Actions */}
      <Container className="px-4 sm:px-8">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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

            <div className="flex items-center gap-2.5">
              {/* View Mode Toggle (Desktop) */}
              <div className="hidden items-center rounded-full border border-line/60 bg-surface-alt p-0.5 sm:flex dark:border-line-dark/60 dark:bg-surface-dark-alt">
                <button
                  type="button"
                  onClick={() => setViewMode("digital")}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${viewMode === "digital"
                    ? "bg-white text-ink shadow-sm dark:bg-black dark:text-white"
                    : "text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-white"
                    }`}
                >
                  Digital CV
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("pdf")}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${viewMode === "pdf"
                    ? "bg-white text-ink shadow-sm dark:bg-black dark:text-white"
                    : "text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-white"
                    }`}
                >
                  PDF View
                </button>
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-ink-dark dark:text-surface-dark"
              >
                {downloading ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Main Content Area */}
      <Container narrow className="px-4 sm:px-6">
        {/* Mobile View Toggle Switcher */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-line/60 bg-surface-alt p-1 sm:hidden dark:border-line-dark/60 dark:bg-surface-dark-alt">
          <button
            type="button"
            onClick={() => setViewMode("digital")}
            className={`flex-1 rounded-lg py-1.5 text-center text-[13px] font-medium transition-all ${viewMode === "digital"
              ? "bg-white text-ink shadow-sm dark:bg-black dark:text-white"
              : "text-ink-secondary"
              }`}
          >
            Digital CV
          </button>
          <button
            type="button"
            onClick={() => setViewMode("pdf")}
            className={`flex-1 rounded-lg py-1.5 text-center text-[13px] font-medium transition-all ${viewMode === "pdf"
              ? "bg-white text-ink shadow-sm dark:bg-black dark:text-white"
              : "text-ink-secondary"
              }`}
          >
            PDF Embed
          </button>
        </div>

        {viewMode === "digital" ? (
          /* ─── Modern Responsive Digital Resume Sheet ─── */
          <Reveal>
            <article className="overflow-hidden rounded-2xl border border-line/80 bg-surface p-6 shadow-sm transition-all sm:p-10 md:p-12 dark:border-line-dark/70 dark:bg-surface-dark dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
              {/* Resume Header */}
              <header className="border-b border-line/50 pb-8 dark:border-line-dark/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-ink-dark">
                      Kurt Dylan R. Viray
                    </h1>
                    <p className="mt-1 text-[15px] font-medium text-accent dark:text-accent-dark">
                      {SITE.role} • Graphic Designer
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[12px] font-mono text-ink-secondary dark:text-ink-dark-secondary sm:text-right">
                    <span>Sual, Pangasinan</span>
                    <span className="opacity-40">•</span>
                    <span>+63 961 741 5050</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SITE.email)}&su=${encodeURIComponent("Job Inquiry / Collaboration — Dylan Ramos")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent hover:underline dark:hover:text-accent-dark"
                  >
                    kurtdylanviray@gmail.com
                  </a>
                  <span className="opacity-30">•</span>
                  <a
                    href="https://dylanramos.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent hover:underline dark:hover:text-accent-dark"
                  >
                    dylanramos.vercel.app
                  </a>
                </div>
              </header>

              {/* Education */}
              <section className="mt-8">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
                  Education
                </h2>
                <div className="mt-3">
                  <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                    <h3 className="text-[16px] font-semibold text-ink dark:text-ink-dark">
                      Pangasinan State University
                    </h3>
                    <span className="text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
                      Lingayen, Pangasinan • 2026
                    </span>
                  </div>
                  <p className="text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
                    Bachelor of Science in Information Technology — Major in Mobile and Web Development
                  </p>
                  <p className="mt-1 text-[12.5px] text-ink-tertiary dark:text-ink-dark-secondary">
                    Relevant Coursework: Data Structures & Algorithms, Operating Systems, Web & Mobile Development
                  </p>
                </div>
              </section>

              {/* Work Experience */}
              <section className="mt-8 border-t border-line/40 pt-8 dark:border-line-dark/40">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
                  Work Experience
                </h2>

                <div className="mt-4 space-y-6">
                  {/* HRMO */}
                  <div>
                    <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                      <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                        Human Resource Management Office (HRMO)
                      </h3>
                      <span className="text-[12.5px] text-ink-secondary dark:text-ink-dark-secondary">
                        Feb 2026 – May 2026
                      </span>
                    </div>
                    <div className="text-[13.5px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                      IT Support — Student Intern
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[13.5px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                      <li>
                        Assisted in office system operations, employee record management, document processing, and troubleshooting technical issues.
                      </li>
                      <li>
                        Provided technical support for daily administrative tasks, organized electronic files, and maintained accurate office data handling.
                      </li>
                    </ul>
                  </div>

                  {/* RHU */}
                  <div>
                    <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                      <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                        Rural Health Unit (RHU)
                      </h3>
                      <span className="text-[12.5px] text-ink-secondary dark:text-ink-dark-secondary">
                        Internship Rotation
                      </span>
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[13.5px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                      <li>
                        Assisted in organizing and encoding health-related records while supporting administrative workflows and digital processes.
                      </li>
                      <li>
                        Troubleshot technical issues and ensured accurate, secure handling of digital and physical records.
                      </li>
                    </ul>
                  </div>

                  {/* PACD */}
                  <div>
                    <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                      <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                        Public Assistance and Complaints Desk (PACD)
                      </h3>
                      <span className="text-[12.5px] text-ink-secondary dark:text-ink-dark-secondary">
                        Support & Service
                      </span>
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[13.5px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                      <li>
                        Assisted clients with inquiries and concerns, coordinated with relevant offices, and maintained support records.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Projects */}
              <section className="mt-8 border-t border-line/40 pt-8 dark:border-line-dark/40">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
                  Featured Projects
                </h2>

                <div className="mt-4 space-y-5">
                  <div>
                    <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                      <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                        Varex AI — AI-Powered Desktop Assistant
                      </h3>
                      <span className="text-[12.5px] font-mono text-ink-secondary dark:text-ink-dark-secondary">
                        Next.js • TypeScript • Tailwind • OpenRouter
                      </span>
                    </div>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                      Real-time conversational AI system with streaming responses, speech recognition, voice synthesis, syntax-highlighted code blocks, and owner-level system commands.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                      <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                        Motus — Habit Tracker & PWA
                      </h3>
                      <span className="text-[12.5px] font-mono text-ink-secondary dark:text-ink-dark-secondary">
                        Next.js • TypeScript • Supabase • PostgreSQL
                      </span>
                    </div>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                      Progressive web application featuring one-tap habit check-ins, real-time streaks, progress analytics, live community stats, and Row Level Security.
                    </p>
                  </div>
                </div>
              </section>

              {/* Technical Skills & Certifications */}
              <section className="mt-8 border-t border-line/40 pt-8 dark:border-line-dark/40">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
                  Skills & Certifications
                </h2>

                <div className="mt-3 space-y-3">
                  <div>
                    <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">Technical Stack: </span>
                    <span className="text-[13.5px] text-ink-secondary dark:text-ink-dark-secondary">
                      JavaScript, TypeScript, React, Next.js, Node.js, PostgreSQL, Supabase, Tailwind CSS, Prisma, Git, Docker, REST APIs, RLS.
                    </span>
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-ink dark:text-ink-dark">Certifications: </span>
                    <span className="text-[13.5px] text-ink-secondary dark:text-ink-dark-secondary">
                      Responsive Web Design, JavaScript Algorithms and Data Structures, Front End Development Libraries, Intro to Cybersecurity, Generative AI.
                    </span>
                  </div>
                </div>
              </section>
            </article>
          </Reveal>
        ) : (
          /* ─── Native PDF Embed Viewer ─── */
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface-alt shadow-sm dark:border-line-dark/70 dark:bg-surface-dark-alt">
              <div className="relative h-[75vh] min-h-[520px] w-full">
                <iframe
                  src={`${resumeUrl}#toolbar=0&navpanes=0`}
                  className="h-full w-full border-0 bg-white"
                  title={`${SITE.name} Resume PDF`}
                />
              </div>
              <div className="flex items-center justify-between border-t border-line/50 p-4 text-[13px] text-ink-secondary dark:border-line-dark/50 dark:text-ink-dark-secondary">
                <span>PDF not loading on mobile?</span>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="font-medium text-accent hover:underline dark:text-accent-dark"
                >
                  Download directly
                </button>
              </div>
            </div>
          </Reveal>
        )}

        {/* Bottom Permanent Action Bar: Back to Home + Download */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line/60 bg-surface-alt/70 p-6 sm:flex-row sm:p-8 dark:border-line-dark/60 dark:bg-surface-dark-alt/70">
          <div>
            <h3 className="text-[16px] font-semibold text-ink dark:text-ink-dark">
              Looking to hire or collaborate?
            </h3>
            <p className="text-[13.5px] text-ink-secondary dark:text-ink-dark-secondary">
              Let&apos;s build fast, responsive, and considered software together.
            </p>
          </div>

          <div className="flex w-auto flex-row items-center gap-2.5 sm:w-auto">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-[13px] font-medium text-ink transition-all hover:bg-black/[0.04] active:scale-95 dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-white/[0.06]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
                <circle cx="9" cy="12" r="0.8" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
                <circle cx="15" cy="12" r="0.8" fill="currentColor" stroke="none" />
              </svg>
              <span>Contact</span>
            </Link>

            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SITE.email)}&su=${encodeURIComponent("Job Inquiry / Collaboration — Dylan Ramos")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all hover:opacity-90 active:scale-95 dark:bg-ink-dark dark:text-surface-dark"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>Gmail</span>
            </a>
          </div>
        </div>
      </Container>


    </div>
  );
}
