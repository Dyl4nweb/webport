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
          <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6 md:flex-row md:p-8">
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

              {/* Buttons */}
              <div className="mt-auto flex flex-wrap gap-3 pt-4">
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