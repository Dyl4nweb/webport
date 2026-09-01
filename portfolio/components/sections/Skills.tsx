"use client";

import { memo, useMemo } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TechIcon from "@/components/ui/TechIcon";
import { skills } from "@/data/skills";
import { cn } from "@/lib/utils";

interface SkillGroup {
  category: string;
  items: string[];
}

const allSkills: string[] = (skills as SkillGroup[]).flatMap(
  (group) => group.items ?? []
);

function splitIntoRows(items: string[], rowCount: number): string[][] {
  const rows: string[][] = Array.from({ length: rowCount }, () => []);
  items.forEach((item, index) => {
    rows[index % rowCount].push(item);
  });
  return rows;
}

function SkillPill({ name }: { name: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 sm:gap-2.5",
        "rounded-full border border-black/8 dark:border-white/10",
        "bg-white/70 dark:bg-white/[0.04]",
        "backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]",
        "px-3.5 py-1.5 sm:px-5 sm:py-2.5",
        "transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/25"
      )}
    >
      <TechIcon name={name} />
      <span className="whitespace-nowrap text-[12px] sm:text-[13.5px] font-medium tracking-tight text-ink dark:text-ink-dark">
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
  speed = 35,
}: MarqueeRowProps) {
  const repeated = useMemo(
    () => [...items, ...items, ...items, ...items],
    [items]
  );

  if (!items.length) return null;

  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden select-none py-1 sm:py-1.5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
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
  const rows = useMemo(() => splitIntoRows(allSkills, 3), []);

  return (
    <section
      aria-label="Technologies & Skills"
      className="relative overflow-hidden py-16 sm:py-24 md:py-32"
      style={{ contain: "layout style" }}
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/[0.04] via-transparent to-transparent blur-xl dark:from-accent-dark/[0.04]"
      />

      <div className="relative flex flex-col items-center gap-10 sm:gap-14">
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

        {/* Full-width 3-Row Sliding Marquee Tracks matching StatsBanner */}
        <Reveal delay={100} className="w-full">
          <div className="flex w-full flex-col gap-2.5 sm:gap-4">
            <MarqueeRow items={rows[0]} direction="left" speed={70} />
            <MarqueeRow items={rows[1]} direction="right" speed={82} />
            <MarqueeRow items={rows[2]} direction="left" speed={74} />
          </div>
        </Reveal>

        {/* View More Button */}
        <Container>
          <Reveal delay={160}>
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