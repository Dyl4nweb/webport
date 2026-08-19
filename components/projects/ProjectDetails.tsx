import Image from "next/image";
import { Project } from "@/types";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ProjectTechStack from "@/components/projects/ProjectTechStack";

interface ProjectDetailsProps {
  project: Project;
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  return (
    <article>
      <header className="pb-14 pt-40 md:pb-20 md:pt-48">
        <Container className="flex flex-col items-center gap-5 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
            {project.role} · {project.year}
          </span>
          <h1 className="max-w-2xl text-balance text-[40px] font-semibold leading-[1.08] tracking-tight text-ink dark:text-ink-dark md:text-[56px]">
            {project.name}
          </h1>
          <p className="max-w-xl text-balance text-[19px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            {project.tagline}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            {project.liveUrl && (
              <Button href={project.liveUrl} variant="primary" external>
                Visit live site
              </Button>
            )}
            {project.repoUrl && (
              <Button href={project.repoUrl} variant="secondary" external>
                View source
              </Button>
            )}
          </div>
        </Container>
      </header>

      <Container className="mb-16">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-apple-lg bg-surface-alt shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] dark:bg-surface-dark-alt">
          <Image
            src={project.image}
            alt={`${project.name} interface preview`}
            fill
            priority
            sizes="(min-width: 1180px) 1180px, 100vw"
            className="object-cover"
          />
        </div>
      </Container>

      {project.metrics && (
        <Container className="mb-20">
          <div className="grid grid-cols-2 gap-6 rounded-apple border border-line/70 bg-surface-card p-8 dark:border-line-dark/70 dark:bg-surface-dark-card sm:grid-cols-3">
            {project.metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col gap-1 text-center">
                <span className="text-[28px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                  {metric.value}
                </span>
                <span className="text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </Container>
      )}

      <Container narrow className="flex flex-col gap-16 pb-28">
        <section className="flex flex-col gap-4">
          <h2 className="text-[24px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            The problem
          </h2>
          <p className="text-[17px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            {project.problem}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-[24px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            The approach
          </h2>
          <p className="text-[17px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            {project.solution}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-[24px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            Built with
          </h2>
          <ProjectTechStack techStack={project.techStack} />
        </section>
      </Container>
    </article>
  );
}
