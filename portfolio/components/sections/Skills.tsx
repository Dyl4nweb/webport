"use client";

import { memo, useMemo } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TechIcon from "@/components/ui/TechIcon";
import { cn } from "@/lib/utils";

// Strictly verified from data/skills.ts
const CORE_SKILLS_ROW_1 = [
  "Next.js",
  "TypeScript",
  "React",
  "Tailwind CSS",
  "React Native",
  "JavaScript",
];

const CORE_SKILLS_ROW_2 = [
  "Node.js",
  "Supabase",
  "PostgreSQL",
  "MongoDB",
  "Prisma",
  "REST APIs",
];

const CORE_SKILLS_ROW_3 = [
  "Git",
  "Docker",
  "Vercel",
  "SQL",
  "Gemini AI API",
  "OpenAI API",
];

function SkillPill({ name }: { name: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 sm:gap-2.5",
        "rounded-full border border-black/[0.08] dark:border-white/[0.08]",
        "bg-white dark:bg-[#141416]",
        "shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.35)]",
        "px-3.5 py-1.5 sm:px-4.5 sm:py-2",
        "transition-[background-color,border-color,box-shadow,transform] duration-200",
        "hover:-translate-y-0.5 hover:bg-white dark:hover:bg-[#1c1c1f] hover:border-black/20 dark:hover:border-white/20 hover:shadow-md",
        "cursor-default select-none"
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
  // Quadruple the items per track to guarantee wide, continuous coverage on all screen sizes
  const trackItems = useMemo(() => [...items, ...items, ...items, ...items], [items]);

  if (!items.length) return null;

  return (
    <div
      aria-hidden="true"
      className="group relative flex w-full overflow-hidden select-none py-1 sm:py-1.5 [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]"
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 sm:gap-3.5 pr-3 sm:pr-3.5 will-change-transform",
          direction === "left"
            ? "animate-marquee-left group-hover:[animation-play-state:paused]"
            : "animate-marquee-right group-hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {trackItems.map((name, idx) => (
          <SkillPill key={`track1-${name}-${idx}`} name={name} />
        ))}
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 sm:gap-3.5 pr-3 sm:pr-3.5 will-change-transform",
          direction === "left"
            ? "animate-marquee-left group-hover:[animation-play-state:paused]"
            : "animate-marquee-right group-hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
        aria-hidden="true"
      >
        {trackItems.map((name, idx) => (
          <SkillPill key={`track2-${name}-${idx}`} name={name} />
        ))}
      </div>
    </div>
  );
});

export default function Skills() {
  return (
    <section
      aria-label="Technologies & Skills"
      className="relative overflow-hidden py-14 sm:py-18 md:py-24"
    >
      <div className="relative flex flex-col items-center gap-8 sm:gap-10">
        {/* Section Heading */}
        <Container>
          <Reveal>
            <div className="mx-auto w-full max-w-3xl text-center">
              <SectionHeading
                eyebrow="Technologies"
                title="What I build with"
                align="center"
              />
            </div>
          </Reveal>
        </Container>

        {/* Compact 3-Row Sliding Marquee Tracks with Side Margins */}
        <Container className="w-full max-w-5xl px-4 sm:px-6 md:px-8">
          <Reveal delay={100} className="w-full">
            <div className="flex w-full flex-col gap-3 sm:gap-3.5">
              <MarqueeRow items={CORE_SKILLS_ROW_1} direction="left" speed={45} />
              <MarqueeRow items={CORE_SKILLS_ROW_2} direction="right" speed={50} />
              <MarqueeRow items={CORE_SKILLS_ROW_3} direction="left" speed={48} />
            </div>
          </Reveal>
        </Container>

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