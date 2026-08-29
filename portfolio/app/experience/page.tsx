import type { Metadata } from "next";
import Link from "next/link";

import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Contact from "@/components/sections/Contact";

import { experience } from "@/data/experience";
import { formatRange } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Experience",
  description: `${SITE.name}'s experience, projects, and technical journey.`,
};

export default function ExperiencePage() {
  return (
    <>
      {/* Header */}
      <header className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[900px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-b from-accent/[0.045] via-transparent to-transparent blur-xl md:blur-3xl dark:from-accent-dark/[0.045]"
        />

        <Container>
          {/* Back */}
          <Reveal>
            <div className="mb-12">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-[13px] font-medium text-ink-secondary transition-colors duration-300 hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                >
                  <path
                    d="M19 12H5M11 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Back to home</span>
              </Link>
            </div>
          </Reveal>

          {/* Heading */}
          <div className="flex flex-col items-center text-center">
            <Reveal delay={80}>
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                Experience
              </span>
            </Reveal>

            <Reveal delay={140}>
              <h1 className="mt-5 max-w-3xl text-balance text-[40px] font-semibold leading-[1.04] tracking-[-0.04em] text-ink dark:text-ink-dark sm:text-[52px] md:text-[64px]">
                Where I&apos;ve built and learned.
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-balance text-[17px] leading-[1.8] text-ink-secondary dark:text-ink-dark-secondary md:text-[19px]">
                A look at the roles, projects, and experiences that shaped how
                I build software today.
              </p>
            </Reveal>
          </div>
        </Container>
      </header>

      {/* Experience */}
      <section className="relative overflow-hidden pb-28">
        <Container narrow className="flex flex-col gap-0">
          {experience.map((role, index) => (
            <Reveal key={role.company} delay={index * 90}>
              <article className="group relative border-t border-line/40 py-10 dark:border-line-dark/40 md:py-12">
                {/* Timeline marker */}
                <div className="absolute left-0 top-12 hidden md:block">
                  <div className="flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-surface bg-line transition-all duration-300 group-hover:scale-125 group-hover:border-accent group-hover:bg-accent dark:border-surface-dark dark:bg-line-dark dark:group-hover:border-accent-dark dark:group-hover:bg-accent-dark" />
                  </div>
                </div>

                <div className="grid gap-7 md:grid-cols-[170px_1fr] md:gap-12 md:pl-6">
                  {/* Date */}
                  <div>
                    <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                      {formatRange(role.start, role.end)}
                    </span>

                    <span className="mt-1 block text-[12px] text-ink-tertiary dark:text-ink-dark-secondary">
                      {role.location}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-tertiary dark:text-ink-dark-secondary">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h2 className="mt-3 text-[24px] font-semibold leading-tight tracking-[-0.025em] text-ink transition-colors duration-300 group-hover:text-accent dark:text-ink-dark dark:group-hover:text-accent-dark md:text-[28px]">
                      {role.role}
                    </h2>

                    <span className="mt-1 text-[15px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                      {role.company}
                    </span>

                    <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] text-ink-secondary dark:text-ink-dark-secondary">
                      {role.summary}
                    </p>

                    {role.highlights && role.highlights.length > 0 && (
                      <ul className="mt-6 flex flex-col gap-3">
                        {role.highlights.map((point) => (
                          <li
                            key={point}
                            className="flex gap-3 text-[14px] leading-[1.75] text-ink dark:text-ink-dark"
                          >
                            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent dark:bg-accent-dark" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {role.stack && role.stack.length > 0 && (
                      <div className="mt-7 flex flex-wrap gap-2">
                        {role.stack.map((tech) => (
                          <Badge key={tech}>{tech}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}

          {/* Resume */}
          <Reveal delay={experience.length * 90 + 80}>
            <div className="border-t border-line/40 pt-10 dark:border-line-dark/40">
              <Button
                href="/resume/resume.pdf"
                variant="secondary"
                external
                className="transition-transform duration-300 hover:-translate-y-0.5"
              >
                Download full resume
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Contact */}
      <Contact />
    </>
  );
}