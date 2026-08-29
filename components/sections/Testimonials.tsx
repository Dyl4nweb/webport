import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { Testimonial } from "@/types";

const testimonials: Testimonial[] = [
  {
    name: "Priya Nandakumar",
    role: "CEO, Varex AI",
    quote:
      "Alex was our first engineer and set the technical direction the whole product still follows. Calm under pressure, relentless about quality.",
  },
  {
    name: "Marcus Webb",
    role: "VP Engineering, Northline Logistics",
    quote:
      "The inventory rebuild paid for itself in the first quarter. Alex has a rare instinct for cutting scope down to what actually matters.",
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
    <section className="border-t border-line/60 bg-surface-alt py-24 dark:border-line-dark/60 dark:bg-surface-dark-alt md:py-32">
      <Container className="flex flex-col gap-14">
        <SectionHeading eyebrow="Word of mouth" title="What people say" />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between gap-8 rounded-apple bg-surface-card p-8 dark:bg-surface-dark-card"
            >
              <blockquote className="text-[17px] leading-relaxed text-ink dark:text-ink-dark">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                  {t.name}
                </span>
                <span className="text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
                  {t.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
