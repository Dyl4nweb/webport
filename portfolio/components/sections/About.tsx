import Image from "next/image";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import GlitchText from "@/components/ui/GlitchText";

export default function About() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 md:py-32" style={{ contain: "layout style" }}>
      <Container className="relative grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-20">
        {/* Portrait */}
        <Reveal
          className="
            relative mx-auto w-full max-w-[200px] min-[380px]:max-w-[230px]
            sm:max-w-[300px]
            md:max-w-[380px]
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
              shadow-[0_30px_80px_-30px_rgba(0,0,0,0.38)]
              transition-[transform,box-shadow,border-color]
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              hover:-translate-y-1
              hover:shadow-[0_40px_95px_-30px_rgba(0,0,0,0.44)]
              hover:border-line
              dark:border-line-dark/70
              dark:bg-surface-dark-card
              dark:hover:border-line-dark
            "
          >
            <Image
              src="/images/profile/profile.png"
              alt="Portrait"
              fill
              sizes="(max-width: 639px) 270px, (max-width: 767px) 320px, 380px"
              className="
                object-cover
                grayscale-[10%]
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
                from-black/20
                via-transparent
                to-white/[0.04]
                transition-opacity duration-700
                group-hover:opacity-90
              "
            />

            {/* Soft hover glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute inset-0
                bg-gradient-to-br
                from-white/[0.05]
                via-transparent
                to-transparent
                opacity-0
                transition-opacity duration-700
                group-hover:opacity-100
              "
            />

            {/* Inner ring */}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10" />

            {/* Corner detail */}
            <div
              className="
                absolute bottom-4 left-4
                rounded-2xl
                border border-white/20
                bg-black/20
                px-3 py-2.5
                text-white
                backdrop-blur-md
                transition-[transform,background-color]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover:-translate-y-0.5
                group-hover:bg-black/25
                sm:bottom-5 sm:left-5
                sm:px-4 sm:py-3
              "
            >
              <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">
                About me
              </span>

              <span className="mt-1 block text-[12px] font-medium sm:text-[13px]">
                Engineer · Builder
              </span>
            </div>
          </div>
        </Reveal>

        {/* Content */}
        <Reveal
          delay={120}
          className="flex max-w-2xl flex-col items-start"
        >
          <span
            className="
              mb-5
              text-[12px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-accent
              dark:text-accent-dark
            "
          >
            About
          </span>

          <h2
            className="
              text-[24px]
              min-[360px]:text-[28px]
              sm:text-[36px]
              md:text-[46px]
              lg:text-[52px]
              font-semibold
              leading-[1.12]
              sm:leading-[1.05]
              tracking-[-0.03em]
              text-ink
              dark:text-ink-dark
            "
          >
            <GlitchText text="I turn complex problems into " />
            <span className="text-ink-secondary dark:text-ink-dark-secondary">
              <GlitchText text="simple, useful experiences." />
            </span>
          </h2>

          <div
            className="
              mt-6
              max-w-xl
              space-y-5
              text-[16px]
              leading-[1.8]
              text-ink-secondary
              dark:text-ink-dark-secondary
              sm:mt-7
              sm:text-[17px]
            "
          >
            <p>
              I work at the intersection of engineering, product, and design —
              building the systems behind a product and the interface people
              actually use.
            </p>

            <p>
              I enjoy messy problems: unclear workflows, noisy dashboards, and
              ideas that need a clearer direction. My goal is usually the same
              — find the simplest useful idea and build around it.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href="/about" variant="primary">
              More about me
            </Button>

            <span
              className="
                text-[13px]
                text-ink-tertiary
                transition-colors duration-500
                dark:text-ink-dark-secondary
              "
            >
              Engineering × Product × Design
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}