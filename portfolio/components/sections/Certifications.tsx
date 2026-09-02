import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import CertificateCard from "@/components/sections/CertificateCard";
import GlitchText from "@/components/ui/GlitchText";

import { certificates } from "@/data/certificates";

export default function Certifications() {
  const featuredCertificates = certificates.slice(0, 4);

  return (
    <section className="relative overflow-hidden py-14 md:py-20" style={{ contain: "layout style" }}>
      <Container className="flex flex-col gap-10">
        {/* Heading */}
        <Reveal>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-accent dark:text-accent-dark">
              Certifications
            </span>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-2xl text-balance text-3xl min-[360px]:text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.05em] text-ink dark:text-ink-dark leading-[1.08]">
                <GlitchText text="Continuous learning, beyond the code." />
              </h2>

              <Button
                href="/certifications?from=home"
                variant="secondary"
                className="self-start md:self-auto"
              >
                View all certifications
              </Button>
            </div>

            <p className="max-w-xl text-[14px] leading-[1.7] text-ink-secondary dark:text-ink-dark-secondary">
              Certifications and training across cybersecurity, AI, and web
              development.
            </p>
          </div>
        </Reveal>

        {/* Featured certifications */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCertificates.map((certificate, index) => (
            <Reveal
              key={`${certificate.title}-${certificate.issuer}`}
              delay={index * 70}
            >
              <CertificateCard
                certificate={certificate}
                index={index}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}