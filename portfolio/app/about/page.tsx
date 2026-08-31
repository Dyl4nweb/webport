import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Contact from "@/components/sections/Contact";

import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn more about ${SITE.name}, a Full Stack Engineer focused on building modern digital experiences.`,
};

const values = [
  {
    title: "Build with purpose",
    body: "I focus on practical solutions that solve real problems without unnecessary complexity.",
  },
  {
    title: "Keep it clean",
    body: "I value readable code, thoughtful architecture, and simple interfaces.",
  },
  {
    title: "Learn by building",
    body: "I learn best by turning new concepts into real projects and experiments.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[900px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-b from-accent/[0.045] via-transparent to-transparent blur-xl md:blur-3xl dark:from-accent-dark/[0.045]"
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

          <div className="grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-20">
            {/* Portrait */}
            <Reveal delay={80}>
              <div className="group relative mx-auto w-full max-w-[360px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-6 -z-10 transform-gpu rounded-full bg-accent/[0.08] blur-xl md:blur-3xl dark:bg-accent-dark/[0.07]"
                />

                <div className="relative aspect-[0.92] overflow-hidden rounded-[28px] border border-line/70 bg-surface-alt shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 dark:border-line-dark/70 dark:bg-surface-dark-alt">
                  <Image
                    src="/images/profile/profile.png"
                    alt={`Portrait of ${SITE.name}`}
                    fill
                    sizes="(max-width: 768px) 90vw, 360px"
                    className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
                    priority
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/[0.04]" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10" />
                </div>
              </div>
            </Reveal>

            {/* About Me */}
            <Reveal delay={160}>
              <div className="flex flex-col items-start">
                <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                  About me
                </span>

                <h1 className="mt-5 max-w-3xl text-balance text-[38px] font-semibold leading-[1.04] tracking-[-0.04em] text-ink dark:text-ink-dark md:text-[56px]">
                  I&apos;m{" "}
                  <span className="text-ink-secondary dark:text-ink-dark-secondary">
                    {SITE.name}
                  </span>
                  , a Full Stack Engineer building modern digital experiences.
                </h1>

                <p className="mt-7 max-w-2xl text-[18px] leading-[1.8] text-ink-secondary dark:text-ink-dark-secondary">
                  I&apos;m passionate about creating modern, scalable, and
                  user-centered web applications that are fast, responsive,
                  and intuitive.
                </p>

                <p className="mt-5 max-w-2xl text-[17px] leading-[1.8] text-ink-secondary dark:text-ink-dark-secondary">
                  As an Information Technology graduate, I primarily work with{" "}
                  <span className="font-medium text-ink dark:text-ink-dark">
                    Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Supabase.
                  </span>
                </p>

                <Button
                  href="/resume"
                  variant="secondary"
                  className="mt-8 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  View resume
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </header>

      {/* My Approach */}
      <section className="relative overflow-hidden py-24 md:py-28">
        <Container narrow className="flex flex-col gap-8">
          <Reveal>
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
              My approach
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="max-w-3xl text-balance text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink dark:text-ink-dark md:text-[42px]">
              I like turning ideas into products that feel simple, useful, and
              intentional.
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <div className="flex max-w-2xl flex-col gap-5 text-[17px] leading-[1.8] text-ink-secondary dark:text-ink-dark-secondary">
              <p>
                I enjoy working at the intersection of engineering, design,
                and product. For me, building software is not just about
                making something work — it&apos;s about making it clear,
                reliable, and enjoyable to use.
              </p>

              <p>
                I usually start by understanding the problem, breaking it
                down into something manageable, and then building with
                simplicity in mind. I care about clean architecture,
                thoughtful interfaces, performance, and details that make the
                final experience feel polished.
              </p>

              <p>
                I also believe the best way to learn is by building. Side
                projects, experiments, and real applications help me
                strengthen my fundamentals while giving me space to explore
                new technologies.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Principles */}
      <section className="relative overflow-hidden py-24 md:py-28">
        <Container className="flex flex-col gap-14">
          <Reveal>
            <div className="mx-auto w-full max-w-3xl text-center">
              <SectionHeading
                eyebrow="Principles"
                title="How I work"
                deck="Simple principles that guide how I build."
                align="center"
              />
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 90}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-line/70 bg-surface-card p-7 shadow-[0_15px_40px_-30px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-30px_rgba(0,0,0,0.3)] dark:border-line-dark/70 dark:bg-surface-dark-card">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary dark:text-ink-dark-secondary">
                    0{index + 1}
                  </span>

                  <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.02em] text-ink dark:text-ink-dark">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-[15px] leading-[1.7] text-ink-secondary dark:text-ink-dark-secondary">
                    {value.body}
                  </p>

                  <div className="mt-auto pt-7">
                    <div className="h-px bg-line/60 transition-colors duration-500 group-hover:bg-accent/30 dark:bg-line-dark/60 dark:group-hover:bg-accent-dark/30" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact */}
      <Contact />
    </>
  );
}