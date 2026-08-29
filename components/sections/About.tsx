import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function About() {
  return (
    <section className="border-t border-line/60 bg-surface-alt py-24 dark:border-line-dark/60 dark:bg-surface-dark-alt md:py-32">
      <Container className="grid gap-14 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-20">
        <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-apple-lg bg-surface-card shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)] dark:bg-surface-dark-card">
          <Image
            src="/images/profile/profile.png"
            alt="Portrait of Alex Rivera"
            fill
            sizes="340px"
            className="object-cover"
            priority={false}
          />
        </div>

        <div className="flex flex-col items-start gap-5">
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
            About
          </span>
          <h2 className="text-[32px] font-semibold leading-[1.1] tracking-tight text-ink dark:text-ink-dark md:text-[40px]">
            Six years of turning hard problems into simple interfaces.
          </h2>
          <p className="max-w-lg text-[17px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            I&apos;ve spent my career on the line between engineering and product —
            building the systems underneath and the interface on top. My favorite
            work starts messy: a workflow nobody trusts, a dashboard nobody reads.
            I like finding the one clear idea underneath and building around it.
          </p>
          <Button href="/about" variant="secondary" className="mt-2">
            More about me
          </Button>
        </div>
      </Container>
    </section>
  );
}
