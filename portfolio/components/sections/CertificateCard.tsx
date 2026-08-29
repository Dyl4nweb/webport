"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface Certificate {
  title: string;
  issuer: string;
  category: string;
  year: string;
  logo: string;
  image: string;
  description: string;
  verifyUrl?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  index?: number;
}

export default function CertificateCard({
  certificate,
  index = 0,
}: CertificateCardProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  // Lock body scroll when modal opens — iOS Safari compatible with Lenis
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const html = document.documentElement;

    const scrollY = window.scrollY;
    scrollPosRef.current = scrollY;

    const hasScrollbar =
      window.innerWidth > document.documentElement.clientWidth;
    const scrollbarWidth = hasScrollbar
      ? window.innerWidth - document.documentElement.clientWidth
      : 0;

    // Stop Lenis via global instance
    const lenis = window.__lenis;
    if (lenis) {
      lenis.stop();
    }

    // Lock scroll — preserve scrollbar width to prevent layout shift
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Unlock scroll
      body.style.overflow = "";
      html.style.overflow = "";
      body.style.paddingRight = "";

      // Restore scroll position before resuming Lenis
      const savedY = scrollPosRef.current;
      document.documentElement.scrollTop = savedY;
      document.body.scrollTop = savedY;

      // Resume Lenis after position is set
      requestAnimationFrame(() => {
        if (lenis) {
          lenis.start();
        }
      });

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeModal]);

  const rotations = ["rotate-[-1deg]", "rotate-[1deg]", "rotate-[-0.5deg]", "rotate-[0.5deg]"];
  const currentRotation = rotations[index % rotations.length];

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-6"
      style={{ zIndex: 2147483647 }}
      role="dialog"
      aria-modal="true"
      aria-label={certificate.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className="relative z-10 flex w-full max-w-[92vw] sm:max-w-xl flex-col overflow-hidden rounded-[20px] border border-white/10 bg-surface-card shadow-[0_30px_100px_-40px_rgba(0,0,0,0.65)] dark:bg-surface-dark-card"
        style={{ maxHeight: "min(90dvh, 90vh)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-line/60 px-4 py-3 dark:border-line-dark/60 sm:px-5">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-accent dark:text-accent-dark">
              {certificate.category}
            </p>
            <h2 className="mt-0.5 truncate text-[14px] font-semibold tracking-[-0.01em] text-ink dark:text-ink-dark">
              {certificate.title}
            </h2>
            <p className="mt-0.5 text-[11px] text-ink-secondary dark:text-ink-dark-secondary">
              {certificate.issuer} · {certificate.year}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={certificate.image}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-ink transition-all duration-200 hover:bg-ink/[0.1] dark:bg-white/[0.08] dark:text-ink-dark dark:hover:bg-white/[0.12]"
              aria-label="Open certificate image in new tab"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6M12 4v12m-4-4 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <button
              type="button"
              onClick={closeModal}
              aria-label="Close certificate"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-ink transition-all duration-200 hover:bg-ink/[0.1] dark:bg-white/[0.08] dark:text-ink-dark dark:hover:bg-white/[0.12]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-black/[0.025] p-3 dark:bg-white/[0.025] sm:p-5">
          <Image
            src={certificate.image}
            alt={`${certificate.title} certificate`}
            width={1000}
            height={1000}
            className="mx-auto w-auto rounded-[14px] object-contain shadow-[0_18px_45px_-25px_rgba(0,0,0,0.5)]"
            style={{ maxHeight: "min(70dvh, 70vh)" }}
            priority
          />
        </div>

        {/* Footer (mobile) */}
        <div className="border-t border-line/60 px-4 py-2 text-center dark:border-line-dark/60 sm:hidden">
          <a
            href={certificate.image}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-accent hover:underline dark:text-accent-dark"
          >
            Open full image
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <article
        className={`
          group relative flex w-full flex-col justify-between
          overflow-hidden rounded-[18px]
          border border-line/70
          bg-surface-card
          p-5
          shadow-[0_10px_30px_-24px_rgba(0,0,0,0.3)]
          transition-all duration-400
          hover:-translate-y-1.5 hover:rotate-0 hover:scale-[1.01]
          hover:border-accent/30
          hover:shadow-[0_20px_45px_-25px_rgba(0,0,0,0.35)]
          dark:border-line-dark/70
          dark:bg-surface-dark-card
          dark:hover:border-accent-dark/30
          ${currentRotation}
        `}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-line/60 bg-surface shadow-sm dark:border-line-dark/60 dark:bg-surface-dark">
            <Image
              src={certificate.logo}
              alt={certificate.issuer}
              width={48}
              height={48}
              className="h-full w-full object-contain p-1.5"
            />
          </div>
          <h3 className="mt-3 line-clamp-2 text-[14px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink dark:text-ink-dark">
            {certificate.title}
          </h3>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-tertiary dark:text-ink-dark-secondary">
            {certificate.issuer}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-secondary transition-colors duration-200 hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
          >
            <span>⟨ VIEW ⟩</span>
          </button>
          {certificate.verifyUrl && (
            <a
              href={certificate.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-secondary transition-colors duration-200 hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
            >
              <span>⟨ VERIFY ⟩</span>
            </a>
          )}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-accent transition-all duration-400 group-hover:w-full dark:bg-accent-dark"
        />
      </article>

      {open && mounted && createPortal(modal, document.body)}
    </>
  );
}
