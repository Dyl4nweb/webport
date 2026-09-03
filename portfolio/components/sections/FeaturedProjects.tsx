import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { getFeaturedProjects } from "@/lib/projects-data";

export default async function FeaturedProjects() {
  const projects = await getFeaturedProjects();

  return (
    <section className="pt-20 pb-16 sm:pt-24 sm:pb-20 md:pt-32 md:pb-24">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Selected Work"
          title="Projects, in depth"
        />

        <ProjectsGrid projects={projects} showSearch={false} showFilters={false} />

        <Button href="/projects?from=home" variant="secondary" className="self-center px-5 py-2.5 sm:px-8 sm:py-3 text-[13px] sm:text-[14px]">
          View all projects
        </Button>
      </Container>
    </section>
  );
}
