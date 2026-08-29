import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { experience } from "@/data/experience";
import { formatRange } from "@/lib/utils";

export default function Experience() {
  return (
    <section className="border-t border-line/60 py-24 dark:border-line-dark/60 md:py-32">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Experience"
          title="Where I've worked"
          align="left"
        />

        <div className="flex flex-col divide-y divide-line/60 border-y border-line/60 dark:divide-line-dark/60 dark:border-line-dark/60">
          {experience.map((role) => (
            <div
              key={role.company}
              className="grid gap-2 py-8 md:grid-cols-[200px_1fr] md:items-baseline md:gap-10"
            >
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
          ))}
        </div>

        <Button href="/experience" variant="secondary" className="self-start">
          Full experience
        </Button>
      </Container>
    </section>
  );
}
