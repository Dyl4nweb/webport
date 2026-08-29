import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import ProjectGrid from "@/components/projects/ProjectGrid";
import { projects } from "@/data/projects";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Projects",
  description: `Selected projects built by ${SITE.name} — product, engineering, and everything between.`,
};

export default function ProjectsPage() {
  return (
    <>
      <header className="pb-14 pt-40 md:pb-16 md:pt-48">
        <Container className="flex flex-col items-center gap-5 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
            Projects
          </span>
          <h1 className="max-w-2xl text-balance text-[40px] font-semibold leading-[1.08] tracking-tight text-ink dark:text-ink-dark md:text-[56px]">
            A record of things I&apos;ve shipped.
          </h1>
          <p className="max-w-xl text-[18px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            Product work, side projects, and a few things built purely out of
            curiosity. Each one taught me something I still use.
          </p>
        </Container>
      </header>

      <Container className="pb-28">
        <ProjectGrid projects={projects} />
      </Container>
    </>
  );
}
