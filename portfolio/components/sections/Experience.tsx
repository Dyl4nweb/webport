import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { experience } from "@/data/experience";
import { formatRange } from "@/lib/utils";

export default function Experience() {
  return (
    <section className="py-24 md:py-32" style={{ contain: "layout style" }}>
      <Container className="flex flex-col gap-14">
        <Reveal>
          <SectionHeading eyebrow="Experience" title="Where I've worked" align="left" />
        </Reveal>

        <div className="flex flex-col divide-y divide-line/40 dark:divide-line-dark/40">
          {experience.map((role, i) => (
            <Reveal key={role.company} delay={i * 90}>
              <div className="group relative grid gap-2 py-8 pl-5 transition-colors duration-300 hover:bg-ink/[0.02] dark:hover:bg-ink-dark/[0.03] md:grid-cols-[200px_1fr] md:items-baseline md:gap-10 md:pl-6">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100 dark:bg-accent-dark"
                />
                <span className="text-[14px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                  {formatRange(role.start, role.end)}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[19px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                    {role.role} · {role.company}
                  </h3>
                  <p className="max-w-2xl text-[15px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                    {role.summary}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={experience.length * 90 + 60}>
          <Button href="/experience" variant="secondary" className="self-start">
            View full experience
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}