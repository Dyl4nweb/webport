import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export default function Container({
  children,
  className,
  narrow = false,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-6 md:px-10",
        narrow ? "max-w-narrow" : "max-w-content",
        className
      )}
    >
      {children}
    </Tag>
  );
}
