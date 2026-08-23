import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { getFeaturedProjects } from "@/lib/projects-data";

export default async function FeaturedProjects() {
  const projects = await getFeaturedProjects();

  return (
    <section className="py-24 md:py-32" style={{ contain: "layout style" }}>
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Selected Work"
          title="Projects, in depth"
          deck="A few pieces of work I'd stand behind in a room full of critics."
        />

        <ProjectsGrid projects={projects} />

        <Button href="/projects" variant="secondary" className="self-center">
          View all projects
        </Button>
      </Container>
    </section>
  );
}
