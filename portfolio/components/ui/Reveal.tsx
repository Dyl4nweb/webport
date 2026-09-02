"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

// Shared observer across all Reveal instances
let sharedObserver: IntersectionObserver | null = null;
const revealElements = new Map<Element, (visible: boolean) => void>();

function getSharedObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const setVisible = revealElements.get(entry.target);
        if (setVisible && entry.isIntersecting) {
          setVisible(true);
          sharedObserver!.unobserve(entry.target);
          revealElements.delete(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "50px 0px" }
  );
  return sharedObserver;
}

export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = getSharedObserver();
    revealElements.set(el, setVisible);
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      revealElements.delete(el);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        visibility: visible ? "visible" : "hidden",
        transform: visible ? "translate3d(0,0,0)" : "translate3d(0,20px,0)",
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${visible ? delay : 0}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${visible ? delay : 0}ms, visibility 0s linear ${visible ? delay : 0}ms`,
      }}
    >
      {children}
    </div>
  );
}
