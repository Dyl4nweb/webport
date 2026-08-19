import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  deck?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  deck,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl text-[32px] font-semibold leading-[1.1] tracking-tight text-ink dark:text-ink-dark md:text-[44px]">
        {title}
      </h2>
      {deck && (
        <p className="max-w-xl text-[19px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          {deck}
        </p>
      )}
    </div>
  );
}
