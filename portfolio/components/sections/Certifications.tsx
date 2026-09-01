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
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/[0.02] via-transparent to-transparent blur-xl dark:from-accent-dark/[0.02]"
      />

      <Container className="flex flex-col gap-10">
        {/* Heading */}
        <Reveal>
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
              Certifications
            </span>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-2xl text-[21px] min-[360px]:text-[24px] min-[400px]:text-[28px] sm:text-[34px] md:text-[38px] font-semibold leading-[1.25] sm:leading-[1.2] tracking-[-0.02em] text-ink dark:text-ink-dark pb-1">
                <GlitchText text="Continuous learning, beyond the code." />
              </h2>

              <Button
                href="/certifications"
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