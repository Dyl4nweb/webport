import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { SITE } from "@/lib/constants";

export default function Contact() {
  return (
    <section className="py-24 md:py-32">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-xl text-balance text-[32px] font-semibold leading-[1.1] tracking-tight text-ink dark:text-ink-dark md:text-[44px]">
          Have a project in mind? Let&apos;s talk about it.
        </h2>
        <p className="max-w-md text-[17px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          {SITE.location}. Usually replies within a day.
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row">
          <Button href={SITE.calUrl} variant="primary" external>
            Book a call
          </Button>
          <Button href={`mailto:${SITE.email}`} variant="secondary" external>
            {SITE.email}
          </Button>
        </div>
      </Container>
    </section>
  );
}
