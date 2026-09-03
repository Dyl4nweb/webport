import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import GlitchText from "@/components/ui/GlitchText";
import Contact from "@/components/sections/Contact";
import HobbiesInterests from "@/components/about/HobbiesInterests";
import AboutCredentials from "@/components/about/AboutCredentials";
import TechSlider from "@/components/about/TechSlider";

import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn more about ${SITE.name}, a Software Engineer focused on building modern digital experiences.`,
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden pb-12 pt-8 sm:pt-12 md:pb-16 md:pt-14">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[900px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-b from-accent/[0.045] via-transparent to-transparent blur-xl md:blur-3xl dark:from-accent-dark/[0.045]"
        />

        <Container>
          {/* Back to home */}
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

          <div className="grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-20">
            {/* Portrait */}
            <Reveal delay={80}>
              <div className="group relative mx-auto w-full max-w-[210px] min-[380px]:max-w-[240px] sm:max-w-[300px] md:max-w-[360px]">
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
              <div className="flex flex-col items-start gap-3.5 sm:gap-4">
                <span className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                  About me
                </span>

                <h1 className="max-w-2xl text-balance text-3xl min-[360px]:text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink dark:text-ink-dark leading-[1.08]">
                  <GlitchText text={`I'm ${SITE.name} — Software Engineer.`} />
                </h1>

                {/* Clean, Non-Redundant Narrative */}
                <div className="mt-1 flex flex-col gap-3.5 text-[15px] sm:text-[16px] leading-[1.75] text-ink-secondary dark:text-ink-dark-secondary max-w-xl">
                  <p>
                    Passionate about building scalable, user-centered web and mobile applications that bridge clean architecture with polished, intuitive design.
                  </p>

                  <p>
                    I primarily build with{" "}
                    <span className="font-semibold text-ink dark:text-ink-dark">
                      Next.js, TypeScript, React, Tailwind CSS, PostgreSQL, and Supabase
                    </span>
                    , taking full ownership from database schemas and AI integrations to fluid frontend interactions.
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    href="/resume"
                    variant="primary"
                    className="transition-transform duration-300 hover:-translate-y-0.5 text-[13px] px-5 py-2.5"
                  >
                    View resume
                  </Button>
                  <Button
                    href="/contact"
                    variant="secondary"
                    className="transition-transform duration-300 hover:-translate-y-0.5 text-[13px] px-5 py-2.5"
                  >
                    Get in touch
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </header>

      {/* Tech Stack Slider Marquee */}
      <TechSlider />

      {/* Credentials & Education */}
      <AboutCredentials />

      {/* Outside the IDE / Memory Card Stack */}
      <HobbiesInterests />

      {/* Contact */}
      <Contact />
    </>
  );
}