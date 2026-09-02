"use client";

import Image from "next/image";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
  onOpen: (project: Project) => void;
}

export default function ProjectCard({ project, priority = false, onOpen }: ProjectCardProps) {
  return (
    <button
      onClick={() => onOpen(project)}
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-black/[0.08] bg-surface-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-lg dark:border-white/[0.08] dark:bg-surface-dark-card dark:hover:border-white/20 dark:hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)]"
    >
      {/* Image Container with Sleek 16:9 Proportion */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/[0.03] dark:bg-white/[0.03]">
        <Image
          src={project.image}
          alt={`${project.name} preview`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5" />
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col gap-2 sm:gap-2.5 p-3.5 sm:p-5">
        {/* Category & Year */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-wider text-accent dark:text-accent-dark">
            {project.category}
          </span>
          <span className="font-mono text-[10.5px] sm:text-[11px] text-ink-tertiary dark:text-ink-dark-secondary">
            {project.year}
          </span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 text-[15px] sm:text-[17px] font-bold tracking-tight text-ink transition-colors group-hover:text-accent dark:text-ink-dark dark:group-hover:text-accent-dark">
          {project.name}
        </h3>

        {/* Tagline */}
        <p className="line-clamp-2 text-[12px] sm:text-[13px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          {project.tagline}
        </p>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-black/[0.06] bg-black/[0.02] px-1.5 sm:px-2 py-0.5 text-[10.5px] sm:text-[11px] font-medium text-ink-secondary dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-ink-dark-secondary"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="rounded-md px-1.5 py-0.5 text-[10px] sm:text-[10.5px] font-mono text-ink-tertiary dark:text-ink-dark-secondary">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>

        {/* Subtle Action Footer */}
        <div className="mt-auto flex items-center justify-between pt-1.5 sm:pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
          <span className="text-[12px] sm:text-[12.5px] font-semibold text-ink group-hover:text-accent dark:text-ink-dark dark:group-hover:text-accent-dark flex items-center gap-1 transition-colors">
            View Details
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </button>
  );
}