import type { Metadata } from "next";
import Link from "next/link";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import TechIcon from "@/components/ui/TechIcon";

import { skills } from "@/data/skills";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tech Stack",
  description: `The complete technology stack ${SITE.name} uses to design, build, and ship products.`,
};

function TechPill({ name }: { name: string }) {
  return (
    <div
      className="
        inline-flex items-center gap-2
        rounded-full
        border border-line/70
        bg-surface-card
        px-5 py-2.5
        dark:border-line-dark/70
        dark:bg-surface-dark-card
      "
    >
      <TechIcon name={name} />
      <span
        className="
          whitespace-nowrap
          text-[13.5px]
          font-medium
          tracking-[-0.01em]
          text-ink-secondary
          dark:text-ink-dark-secondary
        "
      >
        {name}
      </span>
    </div>
  );
}

export default function TechStackPage() {
  return (
    <>
      {/* Header */}
      <header className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[900px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-b from-accent/[0.045] via-transparent to-transparent blur-xl md:blur-3xl dark:from-accent-dark/[0.045]"
        />

        <Container>
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

          <div className="max-w-3xl">
            <Reveal delay={80}>
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                Technologies
              </span>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="mt-5 text-balance text-[38px] font-semibold leading-[1.04] tracking-[-0.04em] text-ink dark:text-ink-dark md:text-[56px]">
                Tech stack
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-2xl text-[17px] leading-[1.8] text-ink-secondary dark:text-ink-dark-secondary">
                Every technology I use across frontend, backend, tooling, and
                AI — grouped by where it fits in how I build.
              </p>
            </Reveal>
          </div>
        </Container>
      </header>

      {/* Stack groups */}
      <section className="relative overflow-hidden pb-24 md:pb-32">
        <Container>
          <div className="mx-auto flex max-w-5xl flex-col gap-14 md:gap-16">
            {skills.map((group, groupIndex) => (
              <div key={group.category} className="flex flex-col gap-7">
                <Reveal delay={groupIndex * 60}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-line/50 pb-4 dark:border-line-dark/50">
                    <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-ink dark:text-ink-dark md:text-[24px]">
                      {group.category}
                    </h2>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary dark:text-ink-dark-secondary">
                      {group.items.length}{" "}
                      {group.items.length === 1 ? "tool" : "tools"}
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={groupIndex * 60 + 60}>
                  <div className="flex flex-wrap gap-2.5">
                    {group.items.map((item) => (
                      <TechPill key={item} name={item} />
                    ))}
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
