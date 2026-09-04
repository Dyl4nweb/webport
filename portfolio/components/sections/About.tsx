import Image from "next/image";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import GlitchText from "@/components/ui/GlitchText";

export default function About() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-28" style={{ contain: "layout style" }}>
      <Container className="relative grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-16 lg:gap-20">
        {/* Portrait */}
        <Reveal
          className="
            relative mx-auto w-full max-w-[220px] min-[380px]:max-w-[250px]
            sm:max-w-[300px]
            md:max-w-[360px]
          "
        >
          {/* Soft glow */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute -inset-8 -z-10
              rounded-full
              bg-accent/[0.08]
              blur-xl md:blur-3xl
              transition-transform duration-1000
              ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:scale-105
              dark:bg-accent-dark/[0.07]
            "
          />

          {/* Offset frame */}
          <div
            aria-hidden="true"
            className="
              absolute inset-3 -z-10
              translate-x-3 translate-y-3
              rounded-[26px]
              border border-line/50
              bg-surface-card/40
              transition-transform duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              dark:border-line-dark/50
              dark:bg-surface-dark-card/40
            "
          />

          {/* Image card */}
          <div
            className="
              group relative
              aspect-[0.92] w-full
              overflow-hidden rounded-[26px]
              border border-line/70
              bg-surface-card
              shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]
              transition-[transform,box-shadow,border-color]
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              hover:-translate-y-1
              hover:shadow-[0_30px_80px_-25px_rgba(0,0,0,0.4)]
              hover:border-line
              dark:border-line-dark/70
              dark:bg-surface-dark-card
              dark:hover:border-line-dark
            "
          >
            <Image
              src="/images/profile/profile.png"
              alt="Portrait of Dylan Ramos"
              fill
              sizes="(max-width: 639px) 270px, (max-width: 767px) 320px, 380px"
              className="
                object-cover
                grayscale-[8%]
                transition-transform
                duration-[1400ms]
                ease-[cubic-bezier(0.16,1,0.3,1)]
                group-hover:scale-[1.035]
              "
              priority={false}
            />

            {/* Image overlay */}
            <div
              className="
                pointer-events-none absolute inset-0
                bg-gradient-to-t
                from-black/25
                via-transparent
                to-white/[0.04]
                transition-opacity duration-700
                group-hover:opacity-90
              "
            />

            {/* Inner ring */}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10" />

            {/* Corner detail */}
            <div
              className="
                absolute bottom-3 left-3 min-[360px]:bottom-4 min-[360px]:left-4
                rounded-2xl
                border border-white/20
                bg-black/40
                px-2.5 py-2 min-[360px]:px-3 min-[360px]:py-2.5
                text-white
                backdrop-blur-md
                transition-[transform,background-color]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover:-translate-y-0.5
                group-hover:bg-black/50
                sm:bottom-5 sm:left-5
                sm:px-4 sm:py-3
              "
            >
              <span className="block text-[8.5px] min-[360px]:text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-[10px]">
                About me
              </span>

              <span className="mt-0.5 min-[360px]:mt-1 block text-[11px] min-[360px]:text-[12px] font-medium sm:text-[13px]">
                Engineer · Builder
              </span>
            </div>
          </div>
        </Reveal>

        {/* Content */}
        <Reveal
          delay={120}
          className="flex w-full max-w-2xl flex-col items-start"
        >
          <span className="mb-3 sm:mb-4 font-mono text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-accent dark:text-accent-dark">
            About
          </span>

          <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold tracking-[-0.03em] sm:tracking-[-0.05em] text-ink dark:text-ink-dark leading-[1.14] sm:leading-[1.08]">
            <GlitchText text="I turn complex problems into simple, useful experiences." />
          </h2>

          <div
            className="
              mt-4 sm:mt-6
              w-full max-w-xl
              space-y-3.5 sm:space-y-4
              text-[14.5px] min-[360px]:text-[15px] sm:text-[17px]
              leading-[1.7] sm:leading-[1.8]
              text-ink-secondary
              dark:text-ink-dark-secondary
            "
          >
            <p>
              I work at the intersection of engineering, product, and design —
              building scalable systems behind the scenes and clean, intuitive
              interfaces people actually enjoy using.
            </p>

            <p>
              I enjoy solving messy challenges: offline-first architectures,
              real-time databases, and workflows that need clear direction.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 w-full">
            <Button href="/about" variant="primary">
              More about me
            </Button>

            <span className="font-mono text-[11px] min-[360px]:text-[12px] sm:text-[13px] text-ink-tertiary dark:text-ink-dark-secondary">
              Engineering × Product × Design
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}