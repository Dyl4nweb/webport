import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { services } from "@/data/services";

const icons: Record<string, React.ReactNode> = {
  layers: (
    <path
      d="M12 3.5 3 8.5l9 5 9-5-9-5ZM3 15.5l9 5 9-5M3 12l9 5 9-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  grid: (
    <path
      d="M4 4h6.5v6.5H4V4Zm9.5 0H20v6.5h-6.5V4ZM4 13.5h6.5V20H4v-6.5Zm9.5 0H20V20h-6.5v-6.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  sparkles: (
    <path
      d="M12 3v4M12 17v4M4 12h4M16 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  ),
  gauge: (
    <path
      d="M4 15a8 8 0 1 1 16 0M12 15l4-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export default function Services() {
  return (
    <section className="py-24 md:py-32">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="How I can help"
          title="Ways we could work together"
        />

        <div className="grid gap-px overflow-hidden rounded-apple border border-line/70 bg-line/70 dark:border-line-dark/70 dark:bg-line-dark/70 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="flex flex-col gap-4 bg-surface-card p-8 dark:bg-surface-dark-card"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-accent dark:text-accent-dark">
                {icons[service.icon]}
              </svg>
              <h3 className="text-[18px] font-semibold tracking-tight text-ink dark:text-ink-dark">
                {service.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
