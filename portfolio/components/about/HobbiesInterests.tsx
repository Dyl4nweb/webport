"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import GlitchText from "@/components/ui/GlitchText";
import { HOBBIES_LIST, MEMORY_CARDS } from "@/data/hobbies";
import { cn } from "@/lib/utils";
import MemoryCardStack from "./MemoryCardStack";

export default function HobbiesInterests() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Trigger smooth unlock transition
  const handleUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      setIsUnlocked(true);
      setIsUnlocking(false);
    }, 400);
  };

  // Re-lock the section
  const handleLock = () => {
    setIsUnlocked(false);
  };

  return (
    <section
      id="outside-ide"
      aria-label="Outside the IDE"
      className="relative overflow-visible py-16 sm:py-20 md:py-28"
    >
      {/* Background ambient texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-gradient from-black/[0.02] dark:from-white/[0.02] to-transparent blur-2xl" />

      <Container className="overflow-visible">
        {!isUnlocked ? (
          /* ================= LOCKED TEASER ================= */
          <Reveal>
            <div
              className={cn(
                "relative mx-auto max-w-2xl rounded-3xl border border-line/60 bg-surface-card/60 p-8 text-center backdrop-blur-md transition-all duration-500 sm:p-12",
                "shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:border-line-dark/60 dark:bg-surface-dark-card/60 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                isUnlocking && "scale-95 opacity-0 blur-sm"
              )}
            >
              {/* Vault Icon */}
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-line/80 bg-surface-alt text-ink dark:border-line-dark/80 dark:bg-surface-dark-alt dark:text-ink-dark shadow-sm">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              {/* Title & Description */}
              <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary dark:text-ink-dark-secondary">
                Personal Life Archive
              </span>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">
                <GlitchText text="Outside the IDE" />
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                An interactive personal memory vault with photos, court sessions, lifestyle fits, and off-screen rituals.
              </p>

              {/* Unlock Action Button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  className="group relative inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 text-[13px] sm:text-[14px] font-semibold tracking-wide text-surface shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 dark:bg-ink-dark dark:text-surface-dark cursor-pointer select-none"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:rotate-12"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                  <span>{isUnlocking ? "Unlocking Vault..." : "ENTER DIMENSION"}</span>
                </button>
              </div>
            </div>
          </Reveal>
        ) : (
          /* ================= UNLOCKED SECTION ================= */
          <div className="flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-500">
            {/* Top Bar with Lock Back Button */}
            <div className="flex items-center justify-between pb-2">
              <span className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary dark:text-ink-dark-secondary">
                Personal Vault Access · Unlocked
              </span>

              <button
                type="button"
                onClick={handleLock}
                className="group inline-flex items-center gap-1.5 rounded-full bg-surface-card dark:bg-surface-dark-card border border-line/70 dark:border-line-dark/70 px-3.5 py-1.5 text-[12px] font-mono font-medium text-ink-secondary dark:text-ink-dark-secondary transition-all hover:border-black/30 dark:hover:border-white/30 hover:text-ink dark:hover:text-ink-dark select-none cursor-pointer"
                title="Lock section"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Lock vault</span>
              </button>
            </div>

            {/* Unlocked 2-Column Layout */}
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center xl:gap-16">
              {/* Left Column: Eyebrow, Title & Pill Badges */}
              <div className="flex flex-col items-start">
                <SectionHeading
                  eyebrow="Beyond The Screen"
                  title="Outside the IDE"
                  deck="When I step away from the code editor and close the IDE, these are the rituals, active sports, and downtime passions that keep me inspired and grounded."
                  align="left"
                />

                {/* Hobbies Pill Badges (Hover-only display) */}
                <div className="mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {HOBBIES_LIST.map((hobby) => (
                    <div
                      key={hobby.id}
                      className={cn(
                        "group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider transition-all duration-300 select-none cursor-default",
                        "border border-line/70 dark:border-line-dark/70 bg-surface-card dark:bg-surface-dark-card text-ink dark:text-ink-dark shadow-sm",
                        "hover:border-black/30 dark:hover:border-white/30 hover:bg-surface-alt dark:hover:bg-[#232326] hover:scale-105 hover:shadow-md"
                      )}
                    >
                      <span className="text-base transition-transform duration-200 group-hover:scale-120">
                        {hobby.emoji}
                      </span>
                      <span>{hobby.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: 3D Physics Fanned Deck of Memory Cards */}
              <div className="flex flex-col items-center justify-center pt-2 sm:pt-4 overflow-visible">
                {/* Interactive Fanned Deck Stage */}
                <div className="relative flex items-center justify-center select-none py-4 px-2 overflow-visible">
                  <div className="relative aspect-square w-[250px] min-[380px]:w-[280px] sm:w-[320px] md:w-[350px] lg:w-[360px] overflow-visible">
                    <MemoryCardStack
                      cards={MEMORY_CARDS}
                      sensitivity={75}
                      sendToBackOnClick={true}
                    />
                  </div>
                </div>

                {/* Helper prompt matching user theme */}
                <div className="mt-8 sm:mt-10 flex items-center justify-center gap-2 font-mono text-[11px] min-[380px]:text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary dark:text-ink-dark-secondary select-none">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="animate-pulse shrink-0 opacity-70"
                  >
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                  <span>CLICK OR DRAG STACK TO SHUFFLE MEMORY CARDS</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
