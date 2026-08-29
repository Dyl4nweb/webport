import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import ProjectGrid from "@/components/projects/ProjectGrid";
import { getFeaturedProjects } from "@/data/projects";

export default function FeaturedProjects() {
  const projects = getFeaturedProjects();

  return (
    <section className="border-t border-line/60 bg-surface-alt py-24 dark:border-line-dark/60 dark:bg-surface-dark-alt md:py-32">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Selected Work"
          title="Projects, in depth"
          deck="A few pieces of work I'd stand behind in a room full of critics."
        />

        <ProjectGrid projects={projects} />

        <Button href="/projects" variant="secondary" className="self-center">
          View all projects
        </Button>
      </Container>
    </section>
  );
}
