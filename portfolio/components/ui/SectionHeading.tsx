import { cn } from "@/lib/utils";
import GlitchText from "@/components/ui/GlitchText";

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
        "flex flex-col gap-3.5 sm:gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl text-balance text-2xl min-[360px]:text-[26px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink dark:text-ink-dark leading-[1.14] sm:leading-[1.08]">
        <GlitchText text={title} />
      </h2>
      {deck && (
        <p className="max-w-xl text-[15px] sm:text-[17px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          {deck}
        </p>
      )}
    </div>
  );
}
