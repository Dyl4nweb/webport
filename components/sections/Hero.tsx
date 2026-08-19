import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { SITE } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-40 md:pb-32 md:pt-48">
      <Container className="flex flex-col items-center text-center">
        <span className="animate-fadeUp text-[15px] font-medium tracking-tight text-ink-secondary dark:text-ink-dark-secondary [animation-delay:0ms]">
          {SITE.role}
        </span>

        <h1 className="mt-4 animate-fadeUp text-balance text-[44px] font-semibold leading-[1.05] tracking-tight text-ink dark:text-ink-dark [animation-delay:80ms] sm:text-[64px] md:text-[80px]">
          I design and build
          <br />
          software that feels
          <br />
          <span className="bg-gradient-to-r from-ink to-ink-secondary bg-clip-text text-transparent dark:from-ink-dark dark:to-ink-dark-secondary">
            inevitable.
          </span>
        </h1>

        <p className="mt-6 max-w-lg animate-fadeUp text-balance text-[19px] leading-relaxed text-ink-secondary [animation-delay:160ms] dark:text-ink-dark-secondary md:text-[21px]">
          I&apos;m {SITE.name}, a software engineer who turns ambiguous problems into
          products people reach for without thinking twice.
        </p>

        <div className="mt-9 flex animate-fadeUp flex-col gap-4 [animation-delay:240ms] sm:flex-row">
          <Button href="/projects" variant="primary">
            View my work
          </Button>
          <Button href="/contact" variant="secondary">
            Get in touch
          </Button>
        </div>
      </Container>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-ink-secondary/10 via-transparent to-transparent blur-3xl dark:from-ink-dark-secondary/10"
      />
    </section>
  );
}
