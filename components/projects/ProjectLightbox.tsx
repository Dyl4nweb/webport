"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Project } from "@/types";

interface ProjectLightboxProps {
  project: Project;
  initialIndex: number;
  slides: { src: string; title: string; description: string }[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}

export default function ProjectLightbox({
  project,
  initialIndex,
  slides,
  index,
  setIndex,
  onClose,
}: ProjectLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (!el.open) el.showModal();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setIndex(index === 0 ? slides.length - 1 : index - 1);
      if (e.key === "ArrowRight")
        setIndex(index === slides.length - 1 ? 0 : index + 1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, index, slides.length, setIndex]);

  if (slides.length === 0) return null;

  const slide = slides[index];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-[70] m-auto h-[95vh] w-[95vw] max-w-[1400px] rounded-apple-lg bg-transparent p-0 shadow-none backdrop:bg-black/90 backdrop:backdrop-blur-sm"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close lightbox"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Image */}
      <div className="flex h-full items-center justify-center p-12">
        <div className="relative h-full w-full">
          <Image
            key={slide.src}
            src={slide.src}
            alt={`${project.name} — ${slide.title}`}
            fill
            priority
            sizes="95vw"
            className="object-contain"
          />
        </div>
      </div>

      {/* Caption */}
      <div className="absolute bottom-6 left-1/2 max-w-xl -translate-x-1/2 text-center">
        <p className="text-[14px] font-medium text-white/90">{slide.title}</p>
        <p className="mt-1 text-[13px] text-white/60">{slide.description}</p>
      </div>

      {/* Nav arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setIndex(index === 0 ? slides.length - 1 : index - 1)}
            className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Previous screenshot"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => setIndex(index === slides.length - 1 ? 0 : index + 1)}
            className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Next screenshot"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          {/* Counter */}
          <div className="absolute bottom-6 right-6 text-[13px] tabular-nums text-white/50">
            {index + 1} / {slides.length}
          </div>
        </>
      )}
    </dialog>
  );
}
