"use client";

import { useEffect, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TechIcon from "@/components/ui/TechIcon";
import { skills } from "@/data/skills";

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

interface MarqueeRowProps {
  items: string[];
  direction?: "left" | "right";
  speed?: number;
  paused: boolean;
}

function MarqueeRow({
  items,
  direction = "right",
  speed = 34,
  paused,
}: MarqueeRowProps) {
  if (!items.length) return null;

  return (
    <div className="relative -my-2 overflow-hidden py-2">
      {/* Edge fades */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-y-0 left-0 z-10 w-16
          bg-gradient-to-r from-surface to-transparent
          dark:from-surface-dark
        "
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-y-0 right-0 z-10 w-16
          bg-gradient-to-l from-surface to-transparent
          dark:from-surface-dark
        "
      />

      <div
        className={`flex w-max gap-3 transform-gpu will-change-transform ${
          direction === "left"
            ? "animate-marquee-left"
            : "animate-marquee-right"
        } motion-reduce:animate-none`}
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: paused ? "paused" : "running",
          visibility: paused ? "hidden" : "visible",
        }}
      >
        {/* First set */}
        <div className="flex shrink-0 gap-3">
          {items.map((name) => (
            <SkillPill key={name} name={name} />
          ))}
        </div>

        {/* Duplicate set */}
        <div className="flex shrink-0 gap-3" aria-hidden="true">
          {items.map((name) => (
            <SkillPill key={`duplicate-${name}`} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillPill({ name }: { name: string }) {
  return (
    <div
      className="
        flex shrink-0 items-center gap-2
        rounded-full
        border border-line/70
        bg-surface-card
        px-5 py-2.5
        dark:border-line-dark/70
        dark:bg-surface-dark-card
      "
    >
      <TechIcon name={name} />
      <span
        className="
          whitespace-nowrap
          text-[13.5px]
          font-medium
          tracking-[-0.01em]
          text-ink-secondary
          dark:text-ink-dark-secondary
        "
      >
        {name}
      </span>
    </div>
  );
}

export default function Skills() {
  const rows = splitIntoRows(allSkills, 3);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
      style={{ contain: "layout style" }}
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute left-1/2 top-0
          h-[360px] w-[720px]
          -translate-x-1/2
          rounded-full
          bg-gradient-to-b
          from-accent/[0.04]
          via-transparent
          to-transparent
          blur-xl
          dark:from-accent-dark/[0.04]
        "
      />

      <Container className="relative flex flex-col items-center gap-14">
        {/* Heading */}
        <Reveal>
          <div className="w-full max-w-3xl text-center">
            <SectionHeading
              eyebrow="Technologies"
              title="What I build with"
              deck="A working set, not a wish list — every tool here shipped in production this year."
              align="center"
            />
          </div>
        </Reveal>

        {/* Marquee */}
        <Reveal delay={100}>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 sm:px-8 lg:px-12">
            <MarqueeRow
              items={rows[0]}
              direction="right"
              speed={55}
              paused={!inView}
            />

            <MarqueeRow
              items={rows[1]}
              direction="left"
              speed={68}
              paused={!inView}
            />

            <MarqueeRow
              items={rows[2]}
              direction="right"
              speed={60}
              paused={!inView}
            />
          </div>
        </Reveal>

        {/* View More */}
        <Reveal delay={160}>
          <Button href="/tech-stack" variant="secondary">
            View More
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}