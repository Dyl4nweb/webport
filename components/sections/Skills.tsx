import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";
import { skills } from "@/data/skills";

export default function Skills() {
  return (
    <section className="py-24 md:py-32">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Toolkit"
          title="What I build with"
          deck="A working set, not a wish list — every tool here shipped in production this year."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => (
            <div
              key={group.category}
              className="flex flex-col gap-4 rounded-apple border border-line/70 bg-surface-card p-7 dark:border-line-dark/70 dark:bg-surface-dark-card"
            >
              <h3 className="text-[15px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
