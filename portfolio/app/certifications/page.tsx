import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import CertificationsGrid from "@/components/certifications/CertificationsGrid";
import GlitchText from "@/components/ui/GlitchText";
import Contact from "@/components/sections/Contact";
import PageBackButton from "@/components/ui/PageBackButton";

import { getCertificates } from "@/lib/certificates-data";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Certifications",
  description: `Certifications, training, and continuous learning by ${SITE.name}.`,
};

interface CertificationsPageProps {
  searchParams?: Promise<{ from?: string }>;
}

export default async function CertificationsPage({ searchParams }: CertificationsPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const certificates = await getCertificates();

  return (
    <>
      <header className="relative overflow-hidden pb-12 pt-8 sm:pt-12 md:pb-16 md:pt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[900px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-b from-accent/[0.045] via-transparent to-transparent blur-xl md:blur-3xl dark:from-accent-dark/[0.045]"
        />

        <Container>
          <Reveal>
            <div className="mb-6 sm:mb-8">
              <PageBackButton fromParam={resolvedParams?.from} defaultTarget="home" />
            </div>
          </Reveal>

          <div className="flex flex-col items-center text-center">
            <Reveal delay={80}>
              <span className="font-mono text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-accent dark:text-accent-dark">
                Certifications
              </span>
            </Reveal>

            <Reveal delay={140}>
              <h1 className="mt-4 max-w-3xl text-balance text-3xl min-[360px]:text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.05em] text-ink dark:text-ink-dark leading-[1.08]">
                <GlitchText text="Learning that goes beyond the code." />
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-balance text-[17px] leading-[1.8] text-ink-secondary dark:text-ink-dark-secondary md:text-[19px]">
                Certifications, courses, and training that continue to
                strengthen my technical foundation.
              </p>
            </Reveal>
          </div>
        </Container>
      </header>

      <section className="relative overflow-hidden pb-28">
        <Container>
          <CertificationsGrid certificates={certificates} />
        </Container>
      </section>

      {/* Contact */}
      <Contact />
    </>
  );
}