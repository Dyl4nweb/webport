import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { SITE } from "@/lib/constants";
import { socialLinks } from "@/data/social";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name}.`,
};

export default function ContactPage() {
  return (
    <>
      <header className="pb-14 pt-40 md:pb-16 md:pt-48">
        <Container className="flex flex-col items-center gap-5 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
            Contact
          </span>
          <h1 className="max-w-2xl text-balance text-[40px] font-semibold leading-[1.08] tracking-tight text-ink dark:text-ink-dark md:text-[56px]">
            Let&apos;s build something worth using.
          </h1>
          <p className="max-w-xl text-[18px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
            Tell me a little about the project. I read every message myself
            and usually reply within a day.
          </p>
        </Container>
      </header>

      <Container narrow className="flex flex-col gap-16 pb-28">
        <ContactForm />

        <div className="flex flex-col gap-6 border-t border-line/60 pt-12 dark:border-line-dark/60">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary dark:text-ink-dark-secondary">
              Direct
            </span>
            <a
              href={`mailto:${SITE.email}`}
              className="text-[17px] font-medium text-ink transition-opacity hover:opacity-60 dark:text-ink-dark"
            >
              {SITE.email}
            </a>
            <span className="text-[15px] text-ink-secondary dark:text-ink-dark-secondary">
              {SITE.location}
            </span>
          </div>

          <div className="flex gap-5">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="text-[15px] font-medium text-ink-secondary transition-opacity hover:opacity-60 dark:text-ink-dark-secondary"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
