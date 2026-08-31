import type { Metadata } from "next";
import Link from "next/link";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

import { SITE } from "@/lib/constants";
import { socialLinks } from "@/data/social";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name}.`,
};

export default function ContactPage() {
  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(SITE.email)}` +
    `&su=${encodeURIComponent("Job Inquiry / Collaboration — Dylan Ramos")}`;

  const calUrl = "https://cal.com/dylanweb444";

  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[900px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-b from-accent/[0.045] via-transparent to-transparent blur-xl md:blur-3xl dark:from-accent-dark/[0.045]"
        />

        <Container>
          {/* Back to home */}
          <Reveal>
            <div className="mb-12">
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

          {/* Heading */}
          <div className="flex flex-col items-center text-center">
            <Reveal delay={80}>
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                Contact
              </span>
            </Reveal>

            <Reveal delay={140}>
              <h1 className="mt-5 max-w-3xl text-balance text-[40px] font-semibold leading-[1.04] tracking-[-0.04em] text-ink dark:text-ink-dark sm:text-[52px] md:text-[64px]">
                Let&apos;s build something worth using.
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-balance text-[17px] leading-[1.8] text-ink-secondary dark:text-ink-dark-secondary md:text-[19px]">
                Have an idea, project, or question? Send me a message and
                I&apos;ll get back to you.
              </p>
            </Reveal>
          </div>
        </Container>
      </header>

      {/* Contact content */}
      <section className="relative overflow-hidden pb-28">
        <Container narrow className="flex flex-col gap-16">
          {/* Form */}
          <Reveal delay={260}>
            <div className="rounded-[28px] border border-line/70 bg-surface-card p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.3)] sm:p-8 md:p-10 dark:border-line-dark/70 dark:bg-surface-dark-card">
              <ContactForm />
            </div>
          </Reveal>

          {/* Book a call */}
          <Reveal delay={320}>
            <div className="flex flex-col gap-6 rounded-[28px] border border-line/70 bg-surface-card p-7 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.28)] sm:flex-row sm:items-center sm:justify-between sm:p-8 md:p-10 dark:border-line-dark/70 dark:bg-surface-dark-card">
              <div className="max-w-lg">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                  Schedule a call
                </span>

                <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-ink dark:text-ink-dark sm:text-[28px]">
                  Prefer to talk things through?
                </h2>

                <p className="mt-3 text-[15px] leading-[1.75] text-ink-secondary dark:text-ink-dark-secondary">
                  Book a quick call and let&apos;s talk about your idea,
                  project, or timeline.
                </p>
              </div>

              <a
                href={calUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 dark:bg-white dark:text-black"
              >
                <span>Book a call</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </Reveal>

          {/* Direct contact */}
          <Reveal delay={380}>
            <div className="border-t border-line/60 pt-10 dark:border-line-dark/60">
              <div className="grid gap-10 sm:grid-cols-2">
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary dark:text-ink-dark-secondary">
                    Direct
                  </span>

                  <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex w-fit items-center gap-2 text-[17px] font-medium text-ink transition-colors duration-300 hover:text-accent dark:text-ink-dark dark:hover:text-accent-dark"
                  >
                    <span>{SITE.email}</span>

                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    >
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>

                  <span className="text-[14px] text-ink-secondary dark:text-ink-dark-secondary">
                    {SITE.location}
                  </span>
                </div>

                {/* Social */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary dark:text-ink-dark-secondary">
                    Connect
                  </span>

                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target={
                          link.url.startsWith("http")
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          link.url.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-[14px] font-medium text-ink-secondary transition-colors duration-200 hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}