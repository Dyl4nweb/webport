import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetails from "@/components/projects/ProjectDetails";
import { getProjectBySlug, projects } from "@/data/projects";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.name,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.description,
      images: [{ url: project.image }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetails project={project} />;
}
