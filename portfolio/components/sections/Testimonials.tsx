import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { Testimonial } from "@/types";

const testimonials: Testimonial[] = [
  {
    name: "Priya Nandakumar",
    role: "CEO, Varex AI",
    quote:
      "Dylan was our first engineer and set the technical direction the whole product still follows. Calm under pressure, relentless about quality.",
  },
  {
    name: "Marcus Webb",
    role: "VP Engineering, Northline Logistics",
    quote:
      "The inventory rebuild paid for itself in the first quarter. Dylan has a rare instinct for cutting scope down to what actually matters.",
  },
  {
    name: "Dana Ferro",
    role: "Founder, Studio Ferro",
    quote:
      "Fourteen client launches, zero fire drills. That's the whole review.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32" style={{ contain: "layout style" }}>
      <Container className="flex flex-col gap-14">
        <SectionHeading eyebrow="Word of mouth" title="What people say" />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="group flex flex-col justify-between gap-8 rounded-apple border border-line/70 bg-surface-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.15)] dark:border-line-dark/70 dark:bg-surface-dark-card dark:hover:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.4)]"
            >
              <blockquote>
                <span
                  aria-hidden="true"
                  className="mb-3 block text-[28px] leading-none text-ink/10 dark:text-ink-dark/15"
                >
                  &ldquo;
                </span>
                <p className="text-[16px] leading-[1.75] text-ink-secondary dark:text-ink-dark-secondary sm:text-[17px]">
                  {t.quote}
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-line/50 pt-5 dark:border-line-dark/50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-[13px] font-semibold text-ink dark:bg-white/[0.08] dark:text-ink-dark">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                    {t.name}
                  </span>
                  <span className="text-[12px] text-ink-tertiary dark:text-ink-dark-secondary">
                    {t.role}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
