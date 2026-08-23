import type { Metadata } from "next";
import Link from "next/link";

import Container from "@/components/ui/Container";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import Reveal from "@/components/ui/Reveal";

import { getProjectsByCategory } from "@/lib/projects-data";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Projects",
  description: `Selected projects built by ${SITE.name} — product, engineering, and everything between.`,
};

export const revalidate = 300;

export default async function ProjectsPage() {
  const [webApps, graphicDesign, landingPages] = await Promise.all([
    getProjectsByCategory("Web App"),
    getProjectsByCategory("Graphic Design"),
    getProjectsByCategory("Landing Page"),
  ]);
  return (
    <>
      {/* Header */}
      <header className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[900px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-b from-accent/[0.045] via-transparent to-transparent blur-xl md:blur-3xl dark:from-accent-dark/[0.045]"
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

          <div className="flex flex-col items-center text-center">
            <Reveal delay={80}>
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                Projects
              </span>
            </Reveal>

            <Reveal delay={140}>
              <h1 className="mt-5 max-w-3xl text-balance text-[40px] font-semibold leading-[1.04] tracking-[-0.04em] text-ink dark:text-ink-dark sm:text-[52px] md:text-[64px]">
                Ideas I&apos;ve Turned Into Products.
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
              { label: "Web Apps", projects: webApps },
              { label: "Landing Page", projects: landingPages },
              { label: "Graphic Design", projects: graphicDesign },
            ]}
          />
        </Container>
      </section>
    </>
  );
}
