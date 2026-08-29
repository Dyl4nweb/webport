import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { skills } from "@/data/skills";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `A closer look at ${SITE.name} — background, values, and how I work.`,
};

const values = [
  {
    title: "Clarity over cleverness",
    body: "The best solution is usually the one that needs the least explaining. I optimize for a codebase and an interface that a new teammate can understand on day one.",
  },
  {
    title: "Ship, then refine",
    body: "I'd rather have something real in front of users by Friday than something perfect by next quarter. Feedback from the real world beats speculation every time.",
  },
  {
    title: "Own the outcome",
    body: "Writing the code is half the job. I care about whether the feature actually solved the problem — and I stick around to find out.",
  },
];

export default function AboutPage() {
  return (
    <>
      <header className="pb-16 pt-40 md:pb-20 md:pt-48">
        <Container className="grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-apple-lg bg-surface-alt dark:bg-surface-dark-alt">
            <Image
              src="/images/profile/profile.png"
              alt={`Portrait of ${SITE.name}`}
              fill
              sizes="300px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col gap-5">
            <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
              About
            </span>
            <h1 className="text-[36px] font-semibold leading-[1.1] tracking-tight text-ink dark:text-ink-dark md:text-[48px]">
              I like problems that don&apos;t have an obvious shape yet.
            </h1>
            <p className="max-w-lg text-[18px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
              I&apos;m {SITE.name}, a software engineer based in {SITE.location}.
              I&apos;ve spent the last six years building products from a founder&apos;s
              first sketch through to something teams depend on daily — mostly in
              small teams, where the line between design and engineering barely exists.
            </p>
            <Button href={SITE.url + "/resume/resume.pdf"} variant="secondary" external className="self-start">
              Download resume
            </Button>
          </div>
        </Container>
      </header>

      <section className="border-t border-line/60 py-24 dark:border-line-dark/60 md:py-28">
        <Container narrow className="flex flex-col gap-8">
          <h2 className="text-[26px] font-semibold tracking-tight text-ink dark:text-ink-dark">
            My story
          </h2>
          <div className="flex flex-col gap-5 text-[17px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            <p>
              I started out building small tools to fix problems at the internship
              I was interning at — a scheduling script here, a broken form there.
              What stuck with me wasn&apos;t the code, it was watching someone&apos;s
              actual workday get shorter because of something I built.
            </p>
            <p>
              That instinct followed me through a design-engineering studio,
              a logistics company rebuilding decade-old internal tools, and now
              a startup building AI-assisted software for legal teams. Different
              domains, same question every time: what is the one thing this
              person needs to see, and how do I get everything else out of the way?
            </p>
            <p>
              Outside of work I run slow, read faster, and am currently three
              chapters into learning to sail — badly, but with enthusiasm.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-line/60 bg-surface-alt py-24 dark:border-line-dark/60 dark:bg-surface-dark-alt md:py-28">
        <Container className="flex flex-col gap-14">
          <SectionHeading eyebrow="Principles" title="How I work" align="left" />
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex flex-col gap-3 rounded-apple bg-surface-card p-7 dark:bg-surface-dark-card"
              >
                <h3 className="text-[17px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                  {value.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-28">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow="Toolkit" title="Skills & tools" align="left" />
          <div className="flex flex-wrap gap-3">
            {skills.flatMap((group) => group.items).map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
