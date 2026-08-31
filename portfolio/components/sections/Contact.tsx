import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { SITE } from "@/lib/constants";

export default function Contact() {
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    SITE.email,
  )}&su=${encodeURIComponent("Job Inquiry / Collaboration — Dylan Ramos")}`;

  return (
    <section className="relative overflow-hidden pb-32 pt-24 md:pb-40 md:pt-32" style={{ contain: "layout style" }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.08] blur-xl dark:bg-accent-dark/[0.08]"
      />

      <Container className="flex flex-col items-center gap-6 text-center">
        <Reveal>
          <h2 className="max-w-xl text-balance text-[32px] font-semibold leading-[1.1] tracking-tight text-ink dark:text-ink-dark md:text-[44px]">
            Have a project in mind? Let&apos;s talk about it.
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <p className="max-w-md text-[17px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            {SITE.location}. Usually replies within a day.
          </p>
        </Reveal>

        <Reveal delay={200} className="mt-2 flex flex-col gap-4 sm:flex-row">
          <Button href={SITE.calUrl} variant="primary" external>
            Book a call
          </Button>

          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-6 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:text-white hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)] dark:border-white/15 dark:hover:bg-white dark:hover:text-black"
          >
            {SITE.email}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path
                d="M7 17 17 7M8 7h9v9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </Reveal>
      </Container>
    </section>
  );
}