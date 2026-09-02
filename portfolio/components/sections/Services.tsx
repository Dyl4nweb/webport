import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
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
  mobile: (
    <path
      d="M10 18H14M7 4h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  paint: (
    <path
      d="M19 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM12 11v7M8 18h8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export default function Services() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20 md:py-28" style={{ contain: "layout style" }}>
      {/* Subtle ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-3xl dark:bg-accent-dark/[0.04]"
      />

      <Container className="flex flex-col gap-8 sm:gap-14">
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            title="How I can help your team or business"
            align="left"
          />
        </Reveal>

        {/* Linear-Style Horizontal Editorial Rows (No Boxy Cards) */}
        <div className="flex flex-col border-t border-black/[0.08] dark:border-white/[0.08]">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 80}>
              <div className="group relative border-b border-black/[0.08] dark:border-white/[0.08] py-4 sm:py-7 md:py-9 px-1.5 sm:px-4 -mx-1.5 sm:-mx-4 rounded-xl transition-all duration-300 hover:bg-black/[0.025] dark:hover:bg-white/[0.025]">
                <div className="grid gap-2.5 sm:gap-4 md:grid-cols-[0.9fr_1.1fr] md:gap-8 lg:gap-12 md:items-start">
                  
                  {/* Left Column: Number Index + Icon + Title */}
                  <div className="flex flex-col gap-1.5 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-mono text-[10px] sm:text-[12px] font-semibold tracking-[0.2em] text-accent dark:text-accent-dark">
                        0{i + 1}
                      </span>
                      <div className="h-px w-4 sm:w-6 bg-accent/40 dark:bg-accent-dark/40" />
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-accent dark:text-accent-dark transition-transform duration-300 group-hover:scale-110">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="sm:w-[18px] sm:h-[18px]">
                          {icons[service.icon]}
                        </svg>
                      </div>
                    </div>

                    <h3 className="text-[16px] min-[360px]:text-[17px] sm:text-[22px] md:text-[24px] font-bold tracking-tight text-ink transition-colors duration-300 group-hover:text-accent dark:text-ink-dark dark:group-hover:text-accent-dark">
                      {service.title}
                    </h3>
                  </div>

                  {/* Right Column: Description + Capability Tags */}
                  <div className="flex flex-col gap-2.5 sm:gap-4 md:pt-1">
                    <p className="text-[13px] sm:text-[15px] leading-normal sm:leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                      {service.description}
                    </p>

                    {service.tags && (
                      <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-black/[0.06] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.03] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-mono text-ink-tertiary dark:text-ink-dark-secondary transition-colors duration-200 group-hover:border-black/15 dark:group-hover:border-white/15"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}