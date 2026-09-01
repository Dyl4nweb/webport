"use client";

import { memo, useMemo } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TechIcon from "@/components/ui/TechIcon";
import { cn } from "@/lib/utils";

// Curated core technologies for a concise, compact 3-row homepage presentation
const CORE_SKILLS_ROW_1 = [
  "Next.js",
  "TypeScript",
  "React",
  "Tailwind CSS",
  "Node.js",
  "JavaScript",
];

const CORE_SKILLS_ROW_2 = [
  "PostgreSQL",
  "Supabase",
  "React Native",
  "Flutter",
  "REST APIs",
  "Prisma",
];

const CORE_SKILLS_ROW_3 = [
  "Git",
  "Docker",
  "Gemini AI API",
  "MongoDB",
  "Figma",
  "Vercel",
];

function SkillPill({ name }: { name: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 sm:gap-2.5",
        "rounded-full border border-black/8 dark:border-white/10",
        "bg-white/75 dark:bg-white/[0.04]",
        "backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]",
        "px-3.5 py-1.5 sm:px-4.5 sm:py-2",
        "transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/25"
      )}
    >
      <TechIcon name={name} />
      <span className="whitespace-nowrap text-[12px] sm:text-[13px] font-medium tracking-tight text-ink dark:text-ink-dark">
        {name}
      </span>
    </div>
  );
}

interface MarqueeRowProps {
  items: string[];
  direction?: "left" | "right";
  speed?: number;
}

const MarqueeRow = memo(function MarqueeRow({
  items,
  direction = "left",
  speed = 32,
}: MarqueeRowProps) {
  const repeated = useMemo(() => [...items, ...items, ...items, ...items], [items]);

  if (!items.length) return null;

  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden select-none py-1 sm:py-1.5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
    >
      <div
        className={cn(
          "flex w-max items-center gap-2.5 sm:gap-3.5 will-change-transform",
          direction === "left"
            ? "animate-marquee-left hover:[animation-play-state:paused]"
            : "animate-marquee-right hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {repeated.map((name, idx) => (
          <SkillPill key={`${name}-${idx}`} name={name} />
        ))}
      </div>
    </div>
  );
});

export default function Skills() {
  return (
    <section
      aria-label="Technologies & Skills"
      className="relative overflow-hidden py-12 sm:py-16 md:py-24"
      style={{ contain: "layout style" }}
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/[0.04] via-transparent to-transparent blur-xl dark:from-accent-dark/[0.04]"
      />

      <div className="relative flex flex-col items-center gap-8 sm:gap-10">
        {/* Section Heading */}
        <Container>
          <Reveal>
            <div className="mx-auto w-full max-w-3xl text-center">
              <SectionHeading
                eyebrow="Technologies"
                title="What I build with"
                deck="A working set, not a wish list — every tool here shipped in production this year."
                align="center"
              />
            </div>
          </Reveal>
        </Container>

        {/* Compact 3-Row Sliding Marquee Tracks */}
        <Reveal delay={100} className="w-full">
          <div className="flex w-full flex-col gap-2.5 sm:gap-3">
            <MarqueeRow items={CORE_SKILLS_ROW_1} direction="left" speed={32} />
            <MarqueeRow items={CORE_SKILLS_ROW_2} direction="right" speed={38} />
            <MarqueeRow items={CORE_SKILLS_ROW_3} direction="left" speed={34} />
          </div>
        </Reveal>

        {/* View More Button */}
        <Container>
          <Reveal delay={140}>
            <div className="flex justify-center">
              <Button href="/tech-stack" variant="secondary">
                View More
              </Button>
            </div>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}