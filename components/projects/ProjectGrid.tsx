import { Project } from "@/types";
import ProjectCard from "@/components/projects/ProjectCard";

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <p className="py-16 text-center text-[15px] text-ink-secondary dark:text-ink-dark-secondary">
        No projects to show yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard key={project.slug} project={project} priority={index < 2} />
      ))}
    </div>
  );
}
