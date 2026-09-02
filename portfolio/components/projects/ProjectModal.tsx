"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Project } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProjectLightbox from "@/components/projects/ProjectLightbox";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

function GooglePlayIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M3.609 1.814C3.23 2.222 3 2.825 3 3.593v16.814c0 .768.23 1.371.609 1.779l.061.059 9.47-9.47v-.223l-9.47-9.47-.07.062z"
        fill="#00D2FF"
      />
      <path
        d="M16.29 15.867l-3.15-3.15v-.224l3.15-3.15.071.04 3.731 2.12c1.066.605 1.066 1.598 0 2.206l-3.731 2.12-.071.038z"
        fill="#FFCE00"
      />
      <path
        d="M16.36 15.827L13.14 12.6 3.609 22.131c.355.378.949.424 1.62.045l11.131-6.349z"
        fill="#FF334B"
      />
      <path
        d="M16.36 8.373L5.229 2.024C4.558 1.645 3.964 1.691 3.609 2.069L13.14 11.6l3.22-3.227z"
        fill="#00E676"
      />
    </svg>
  );
}

function AppleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.7-0.93 2.73 1 .08 2.01-.48 2.63-1.23z" />
    </svg>
  );
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [current, setCurrent] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const slides = project.screenshots ?? [];
  const slide = slides[current] ?? null;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (!el.open) el.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function prev() {
    setCurrent((i) => (i === 0 ? slides.length - 1 : i - 1));
  }

  function next() {
    setCurrent((i) => (i === slides.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        onClose={onClose}
        className="fixed inset-0 z-50 m-auto h-[90vh] w-[92vw] max-w-6xl rounded-apple-lg bg-white/90 p-0 shadow-2xl backdrop-blur-2xl saturate-150 border border-black/10 backdrop:bg-black/60 backdrop:backdrop-blur-sm dark:bg-black/40 dark:border-white/10 dark:shadow-black/50"
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10 md:px-8">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
                {project.category}
              </span>
              <span className="h-3 w-px bg-line dark:bg-line-dark" />
              <span className="text-[13px] text-ink-tertiary dark:text-ink-dark-secondary">
                {project.role} · {project.year}
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-black/5 hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-white/10 dark:hover:text-ink-dark"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body — two columns */}
          <div
            data-lenis-prevent
            className="modal-scrollbar flex flex-1 min-h-0 flex-col gap-8 overflow-y-auto overscroll-contain p-6 md:flex-row md:p-8"
          >
            {/* Left — image carousel */}
            <div className="flex flex-col gap-4 md:w-[55%]">
              {slide && (
                <button
                  onClick={() => setLightboxIndex(current)}
                  className="group relative aspect-[16/9] w-full overflow-hidden rounded-apple-lg bg-black/10 dark:bg-white/10"
                  aria-label={`Open ${slide.title} in full view`}
                >
                  <Image
                    key={slide.src}
                    src={slide.src}
                    alt={`${project.name} — ${slide.title}`}
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover hint */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <svg className="opacity-0 transition-opacity group-hover:opacity-100" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </div>
                </button>
              )}

              {/* Carousel nav */}
              {slides.length > 1 && (
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={prev}
                    className="text-ink-secondary transition-colors hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                    aria-label="Previous screenshot"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <span className="text-[13px] tabular-nums text-ink-tertiary dark:text-ink-dark-secondary">
                    {current + 1} / {slides.length}
                  </span>
                  <button
                    onClick={next}
                    className="text-ink-secondary transition-colors hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark"
                    aria-label="Next screenshot"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Slide caption */}
              {slide && (
                <div className="flex flex-col gap-1 text-center md:text-left">
                  <h4 className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                    {slide.title}
                  </h4>
                  <p className="text-[14px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                    {slide.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right — project info */}
            <div className="flex flex-1 flex-col gap-5 md:w-[45%]">
              <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-ink dark:text-ink-dark md:text-[32px]">
                {project.name}
              </h2>

              <p className="text-[15px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                {project.tagline}
              </p>

              <p className="text-[14px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
                {project.description}
              </p>

              {/* Tech stack */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary dark:text-ink-dark-secondary">
                  Built with
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} tone="accent">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Store Release Notice for Mobile Apps */}
              {project.slug === "motus-mobile" && (
                <div className="flex flex-col gap-2.5 rounded-apple-sm border border-accent/25 bg-accent/[0.05] p-3.5 text-left dark:border-accent-dark/30 dark:bg-accent-dark/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 dark:bg-accent-dark" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent dark:bg-accent-dark" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent dark:text-accent-dark">
                      Store Release Timeline
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1 text-[13px] text-ink-secondary dark:text-ink-dark-secondary">
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]">
                      <div className="flex items-center gap-2 font-medium text-ink dark:text-ink-dark">
                        <GooglePlayIcon className="h-4 w-4 shrink-0" />
                        <span>Google Play Store</span>
                      </div>
                      <span className="text-[12px] font-semibold text-accent dark:text-accent-dark">
                        Releasing Soon
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-lg bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]">
                      <div className="flex items-center gap-2 font-medium text-ink dark:text-ink-dark">
                        <AppleIcon className="h-4 w-4 shrink-0 text-ink dark:text-ink-dark" />
                        <span>Apple App Store (iOS)</span>
                      </div>
                      <span className="text-[12px] font-medium text-ink-tertiary dark:text-ink-dark-secondary">
                        Targeted next month
                      </span>
                    </div>

                    <p className="px-1 text-[12px] text-ink-tertiary dark:text-ink-dark-secondary">
                      Stay updated for official app download links!
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                {project.liveUrl && (
                  <Button href={project.liveUrl} variant="primary" external>
                    Visit live site
                  </Button>
                )}
                {project.repoUrl && (
                  <Button href={project.repoUrl} variant="secondary" external>
                    View source
                  </Button>
                )}
                {project.slug === "motus-mobile" && !project.liveUrl && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-[13px] font-medium text-ink-secondary dark:border-white/10 dark:bg-white/5 dark:text-ink-dark-secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Store Release In Progress</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </dialog>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ProjectLightbox
          project={project}
          initialIndex={lightboxIndex}
          slides={slides}
          index={current}
          setIndex={setCurrent}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}