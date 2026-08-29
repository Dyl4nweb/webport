import Badge from "@/components/ui/Badge";

interface ProjectTechStackProps {
  techStack: string[];
}

export default function ProjectTechStack({ techStack }: ProjectTechStackProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {techStack.map((tech) => (
        <Badge key={tech} tone="accent">
          {tech}
        </Badge>
      ))}
    </div>
  );
}
