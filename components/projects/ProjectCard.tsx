import Image from "next/image";
import Link from "next/link";
import { Project } from "@/types";
import Badge from "@/components/ui/Badge";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export default function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-apple border border-line/70 bg-surface-card transition-transform duration-300 ease-apple hover:-translate-y-1 dark:border-line-dark/70 dark:bg-surface-dark-card">
      <Link href={`/projects/${project.slug}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-surface-alt dark:bg-surface-dark-alt">
        <Image
          src={project.image}
          alt={`${project.name} preview`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 380px, 100vw"
          className="object-cover transition-transform duration-500 ease-apple group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary dark:text-ink-dark-secondary">
          Featured Build
        </span>

        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[19px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            {project.name}
          </h3>
          <span className="shrink-0 text-[13px] text-ink-tertiary dark:text-ink-dark-secondary">
            {project.year}
          </span>
        </div>

        <p className="text-[15px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          {project.tagline}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>

        <Link
          href={`/projects/${project.slug}`}
          className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-ink-dark dark:text-surface-dark"
        >
          Read case study
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 17 17 7M17 7H9M17 7v8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
