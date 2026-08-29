"use client";

import Image from "next/image";
import { Project } from "@/types";
import Badge from "@/components/ui/Badge";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
  onOpen: (project: Project) => void;
}

export default function ProjectCard({ project, priority = false, onOpen }: ProjectCardProps) {
  return (
    <button
      onClick={() => onOpen(project)}
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-apple border border-line/70 bg-surface-card text-left transition-transform duration-300 ease-apple hover:-translate-y-1 dark:border-line-dark/70 dark:bg-surface-dark-card"
    >
      <div className="relative block aspect-[16/10] w-full overflow-hidden bg-surface-alt dark:bg-surface-dark-alt">
        <Image
          src={project.image}
          alt={`${project.name} preview`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 380px, 100vw"
          className="object-cover transition-transform duration-500 ease-apple group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary dark:text-ink-dark-secondary">
          {project.category}
        </span>

        <div className="flex items-center justify-between gap-3">
          <h3 className="line-clamp-1 text-[19px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            {project.name}
          </h3>
          <span className="shrink-0 text-[13px] text-ink-tertiary dark:text-ink-dark-secondary">
            {project.year}
          </span>
        </div>

        <p className="line-clamp-2 h-[48px] text-[15px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          {project.tagline}
        </p>

        <div className="flex min-h-[34px] flex-wrap gap-2">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech} className="whitespace-nowrap">
              {tech}
            </Badge>
          ))}
        </div>

        <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-white transition-opacity group-hover:opacity-85 dark:bg-ink-dark dark:text-surface-dark">
          View Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 17 17 7M17 7H9M17 7v8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </button>
  );
}