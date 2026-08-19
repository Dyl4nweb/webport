import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { experience } from "@/data/experience";
import { formatRange } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Experience",
  description: `${SITE.name}'s career history — roles, companies, and impact.`,
};

export default function ExperiencePage() {
  return (
    <>
      <header className="pb-14 pt-40 md:pb-16 md:pt-48">
        <Container className="flex flex-col items-center gap-5 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
            Experience
          </span>
          <h1 className="max-w-2xl text-balance text-[40px] font-semibold leading-[1.08] tracking-tight text-ink dark:text-ink-dark md:text-[56px]">
            Six years, three teams, one throughline.
          </h1>
          <p className="max-w-xl text-[18px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            From studio work to founding engineering — a full history of where
            I&apos;ve built and what I learned along the way.
          </p>
        </Container>
      </header>

      <Container narrow className="flex flex-col gap-16 pb-28">
        {experience.map((role) => (
          <article
            key={role.company}
            className="flex flex-col gap-5 border-b border-line/60 pb-16 last:border-b-0 last:pb-0 dark:border-line-dark/60"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-[14px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
                {formatRange(role.start, role.end)} · {role.location}
              </span>
              <h2 className="text-[24px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                {role.role}
              </h2>
              <span className="text-[16px] text-ink-secondary dark:text-ink-dark-secondary">
                {role.company}
              </span>
            </div>

            <p className="text-[16px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
              {role.summary}
            </p>

            <ul className="flex flex-col gap-2">
              {role.highlights.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-[15px] leading-relaxed text-ink dark:text-ink-dark"
                >
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent dark:bg-accent-dark" />
                  {point}
                </li>
              ))}
            </ul>

            {role.stack && (
              <div className="flex flex-wrap gap-2 pt-1">
                {role.stack.map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
            )}
          </article>
        ))}

        <Button href="/resume/resume.pdf" variant="secondary" external className="self-start">
          Download full resume (PDF)
        </Button>
      </Container>
    </>
  );
}
