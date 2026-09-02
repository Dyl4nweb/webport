import type { Metadata } from "next";

import Link from "next/link";
import Container from "@/components/ui/Container";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import Reveal from "@/components/ui/Reveal";
import GlitchText from "@/components/ui/GlitchText";
import Contact from "@/components/sections/Contact";

import { getProjectsByCategory } from "@/lib/projects-data";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Projects",
  description: `Selected projects built by ${SITE.name} — product, engineering, and everything between.`,
};

export const revalidate = 300;

export default async function ProjectsPage() {
  const [webApps, graphicDesign, landingPages, mobileApps] = await Promise.all([
    getProjectsByCategory("Web App"),
    getProjectsByCategory("Graphic Design"),
    getProjectsByCategory("Landing Page"),
    getProjectsByCategory("Mobile App"),
  ]);
  return (
    <>
      {/* Header */}
      <header className="relative overflow-hidden pb-12 pt-8 sm:pt-12 md:pb-16 md:pt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[900px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-b from-accent/[0.045] via-transparent to-transparent blur-xl md:blur-3xl dark:from-accent-dark/[0.045]"
        />

        <Container>
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

          <div className="flex flex-col items-center text-center">
            <Reveal delay={80}>
              <span className="font-mono text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-accent dark:text-accent-dark">
                Projects
              </span>
            </Reveal>

            <Reveal delay={140}>
              <h1 className="mt-4 max-w-3xl text-balance text-3xl min-[360px]:text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.05em] text-ink dark:text-ink-dark leading-[1.08]">
                <GlitchText text="Ideas I've Turned Into Products." />
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-balance text-[17px] leading-[1.8] text-ink-secondary dark:text-ink-dark-secondary md:text-[19px]">
                Product work, side projects, and things built out of
                curiosity. Each one taught me something I still use.
              </p>
            </Reveal>
          </div>
        </Container>
      </header>

      {/* Projects by Category */}
      <section className="relative overflow-hidden pb-28">
        <Container>
          <ProjectsGrid
            sections={[
              { label: "Mobile Apps", projects: mobileApps },
              { label: "Web Apps", projects: webApps },
              { label: "Landing Page", projects: landingPages },
              { label: "Graphic Design", projects: graphicDesign },
            ]}
          />
        </Container>
      </section>

      {/* Contact */}
      <Contact />
    </>
  );
}
