"use client";

import { useState } from "react";
import { Project } from "@/types";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectModal from "@/components/projects/ProjectModal";
import Reveal from "@/components/ui/Reveal";

interface CategorySection {
  label: string;
  projects: Project[];
}

interface ProjectsGridProps {
  sections?: CategorySection[];
  projects?: Project[];
}

export default function ProjectsGrid({ sections, projects }: ProjectsGridProps) {
  const [selected, setSelected] = useState<Project | null>(null);

  const resolvedSections: CategorySection[] =
    sections ??
    (projects && projects.length > 0 ? [{ label: "", projects }] : []);

  return (
    <>
      <div className="flex flex-col gap-12">
        {resolvedSections.map((section, categoryIndex) => {
          if (section.projects.length === 0) return null;

          return (
            <section key={section.label || "all"}>
              {section.label && (
                <Reveal>
                  <div className="mb-5 flex items-center gap-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                      {String(categoryIndex + 1).padStart(2, "0")}
                    </span>

                    <span className="h-px flex-1 bg-line dark:bg-line-dark" />

                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink dark:text-ink-dark">
                      {section.label}
                    </h2>
                  </div>
                </Reveal>
              )}

              <div className="grid grid-cols-1 justify-center gap-6 md:grid-cols-2 lg:grid-cols-3">
                {section.projects.map((project, index) => (
                  <Reveal key={project.slug} delay={index * 45} className="h-full">
                    <ProjectCard
                      project={project}
                      priority={categoryIndex === 0 && index < 2}
                      onOpen={setSelected}
                    />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}