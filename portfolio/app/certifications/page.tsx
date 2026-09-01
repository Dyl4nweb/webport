import type { Metadata } from "next";
import Link from "next/link";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import CertificateCard from "@/components/sections/CertificateCard";
import GlitchText from "@/components/ui/GlitchText";
import Contact from "@/components/sections/Contact";

import type { Certificate } from "@/data/certificates";
import { getCertificates } from "@/lib/certificates-data";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Certifications",
  description: `Certifications, training, and continuous learning by ${SITE.name}.`,
};

export default async function CertificationsPage() {
  const certificates = await getCertificates();

  const groupedCertificates = certificates.reduce<
    Record<string, Certificate[]>
  >((groups, certificate) => {
    if (!groups[certificate.category]) {
      groups[certificate.category] = [];
    }

    groups[certificate.category].push(certificate);

    return groups;
  }, {});

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
              <Link
                href="/"
                className="group inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary transition-all hover:bg-black/[0.06] hover:text-ink dark:bg-surface-dark-alt dark:text-ink-dark-secondary dark:hover:bg-white/[0.08] dark:hover:text-ink-dark"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span>Back to home</span>
              </Link>
            </div>
          </Reveal>

          <div className="flex flex-col items-center text-center">
            <Reveal delay={80}>
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                Certifications
              </span>
            </Reveal>

            <Reveal delay={140}>
              <h1 className="mt-5 max-w-3xl text-[26px] min-[360px]:text-[30px] min-[420px]:text-[36px] sm:text-[52px] md:text-[64px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink dark:text-ink-dark pb-1">
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
          <div className="flex flex-col gap-12">
            {Object.entries(groupedCertificates).map(
              ([category, categoryCertificates], categoryIndex) => (
                <section key={category}>
                  {/* Category divider */}
                  <Reveal>
                    <div className="mb-5 flex items-center gap-4">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent dark:text-accent-dark">
                        {String(categoryIndex + 1).padStart(2, "0")}
                      </span>

                      <span className="h-px flex-1 bg-line dark:bg-line-dark" />

                      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink dark:text-ink-dark">
                        {category}
                      </h2>
                    </div>
                  </Reveal>

                  {/* Cards Grid: Ginawang 3 columns para sakto ang laki at hindi siksik */}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryCertificates.map((certificate, index) => (
                      <Reveal
                        key={`${certificate.title}-${certificate.issuer}`}
                        delay={index * 45}
                      >
                        <CertificateCard
                          certificate={certificate}
                          index={index}
                        />
                      </Reveal>
                    ))}
                  </div>
                </section>
              )
            )}


          </div>
        </Container>
      </section>

      {/* Contact */}
      <Contact />
    </>
  );
}