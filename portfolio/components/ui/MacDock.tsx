"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { memo, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";

import LiveAIFace from "@/components/ui/LiveAIFace";

interface DockItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
}

const DOCK_ICONS: Record<string, React.ReactNode> = {
  "/": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  "/about": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  "/projects": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
      <path d="m7 8 2 2-2 2" />
      <path d="M12 12h3" />
    </svg>
  ),
  "/experience": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  "/certifications": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  "/contact": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
};

const NAV_PAGES = [
  { id: "overview", label: "Overview", href: "/", className: "hidden sm:inline-flex" },
  { id: "about", label: "About", href: "/about" },
  { id: "projects", label: "Projects", href: "/projects" },
  { id: "experience", label: "Experience", href: "/experience" },
  { id: "certifications", label: "Certifications", href: "/certifications" },
  { id: "contact", label: "Contact", href: "/contact" },
];

function calculateMagnification(mouseX: number | null, el: HTMLElement | null) {
  if (mouseX === null || !el) return { scale: 1, translateY: 0 };
  const rect = el.getBoundingClientRect();
  const iconCenterX = rect.left + rect.width / 2;
  const distance = Math.abs(mouseX - iconCenterX);
  const radius = 64;

  if (distance < radius) {
    const norm = distance / radius;
    const factor = Math.cos(norm * (Math.PI / 2));
    return {
      scale: 1 + 0.28 * factor,
      translateY: -4 * factor,
    };
  }
  return { scale: 1, translateY: 0 };
}

function performSmoothScrollToTop(duration = 700) {
  const lenis = typeof window !== "undefined" ? window.__lenis : undefined;
  if (lenis) {
    lenis.scrollTo(0, {
      duration: 0.95,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    return;
  }

  if (typeof window === "undefined") return;

  const startY =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

  if (startY <= 0) return;

  const startTime = performance.now();
  const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = easeOutQuart(progress);
    const currentY = Math.round(startY * (1 - ease));

    window.scrollTo(0, currentY);
    if (document.documentElement) document.documentElement.scrollTop = currentY;
    if (document.body) document.body.scrollTop = currentY;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

export const MacDock = memo(function MacDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<HTMLDivElement | null>(null);

  // Pure Back to Top: Always smoothly scrolls to y=0 of the current page
  const scrollToTop = useCallback(() => {
    performSmoothScrollToTop();
  }, []);

  // D Logo: Navigates to Home if on subpage, or smoothly scrolls up if on Home
  const handleLogoClick = useCallback(() => {
    if (pathname === "/") {
      performSmoothScrollToTop();
    } else {
      router.push("/");
    }
  }, [pathname, router]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setMouseX(e.clientX);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
    setHoveredId(null);
  }, []);

  const toggleChat = useCallback(() => {
    window.dispatchEvent(new CustomEvent("aichat:toggle"));
  }, []);

  const { scale: themeScale, translateY: themeTranslateY } = calculateMagnification(
    mouseX,
    themeRef.current
  );

  return (
    <div
      ref={dockRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative inline-flex items-center gap-0.5 min-[350px]:gap-1 min-[400px]:gap-1.5 px-2 min-[350px]:px-2.5 min-[400px]:px-3.5 py-1.5 min-[350px]:py-2 sm:py-2.5 rounded-full",
        "bg-white/85 dark:bg-[#161618]/85",
        "border border-black/[0.08] dark:border-white/[0.12]",
        "backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)]",
        "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.04)]",
        "dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.3)]",
        "transition-[background-color,border-color,box-shadow] duration-300",
        "overflow-visible"
      )}
    >
      <DockItemButton
        id="logo"
        label="Home"
        onClick={handleLogoClick}
        mouseX={mouseX}
        isHovered={hoveredId === "logo"}
        onHoverStart={() => setHoveredId("logo")}
        onHoverEnd={() => setHoveredId(null)}
        active={false}
      >
        <Image
          id="navbar-logo-dock"
          src="/icon.png"
          alt={SITE.name}
          width={24}
          height={24}
          priority
          className="h-4.5 w-4.5 min-[350px]:h-5 min-[350px]:w-5 min-[400px]:h-5.5 min-[400px]:w-5.5 sm:h-6 sm:w-6 object-contain navbar-logo-target"
          style={{ width: "auto", height: "auto" }}
        />
        {pathname === "/" && (
          <span
            aria-hidden="true"
            className="sm:hidden absolute -bottom-1 h-1 w-1 rounded-full bg-accent dark:bg-accent-dark animate-pulse shadow-[0_0_6px_currentColor]"
          />
        )}
      </DockItemButton>

      <span
        aria-hidden="true"
        className="h-4 min-[350px]:h-4.5 sm:h-5.5 w-[1px] bg-black/10 dark:bg-white/15 mx-[0.5px] min-[350px]:mx-0.5 sm:mx-1 shrink-0"
      />

      {NAV_PAGES.map((page) => {
        const active = pathname === page.href;
        return (
          <DockItemLink
            key={page.id}
            id={page.id}
            label={page.label}
            href={page.href}
            active={active}
            mouseX={mouseX}
            isHovered={hoveredId === page.id}
            onHoverStart={() => setHoveredId(page.id)}
            onHoverEnd={() => setHoveredId(null)}
            className={page.className}
          >
            {DOCK_ICONS[page.href]}
          </DockItemLink>
        );
      })}

      <span
        aria-hidden="true"
        className="h-4 min-[350px]:h-4.5 sm:h-5.5 w-[1px] bg-black/10 dark:bg-white/15 mx-[0.5px] min-[350px]:mx-0.5 sm:mx-1 shrink-0"
      />

      <DockItemButton
        id="aichat"
        label="Varex AI"
        onClick={toggleChat}
        mouseX={mouseX}
        isHovered={hoveredId === "aichat"}
        onHoverStart={() => setHoveredId("aichat")}
        onHoverEnd={() => setHoveredId(null)}
        active={false}
      >
        <LiveAIFace
          size={19}
          isHovered={hoveredId === "aichat"}
        />
      </DockItemButton>

      {/* Back to top — visible on both mobile and desktop */}
      <DockItemButton
        id="backtotop"
        label="Back to top"
        onClick={scrollToTop}
        mouseX={mouseX}
        isHovered={hoveredId === "backtotop"}
        onHoverStart={() => setHoveredId("backtotop")}
        onHoverEnd={() => setHoveredId(null)}
        active={false}
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </DockItemButton>

      {/* 5. Theme Toggle Button */}
      <div
        ref={themeRef}
        onMouseEnter={() => setHoveredId("theme")}
        onMouseLeave={() => setHoveredId(null)}
        className="relative flex items-center justify-center origin-center shrink-0"
        style={{
          transform: `scale(${themeScale}) translateY(${themeTranslateY}px)`,
          transition: mouseX !== null
            ? "transform 0.08s ease-out"
            : "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformOrigin: "bottom center",
        }}
      >
        <ThemeToggle />

        {/* Floating Tooltip */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-[100]",
            "whitespace-nowrap rounded-md px-2.5 py-1",
            "font-sans text-[11px] font-semibold tracking-tight leading-none",
            "bg-[#161618]/95 text-white dark:bg-[#fbfbfd]/95 dark:text-black",
            "shadow-[0_4px_16px_rgba(0,0,0,0.35)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)]",
            "border border-white/15 dark:border-black/10",
            "backdrop-blur-md",
            "transition-all duration-200 ease-out",
            hoveredId === "theme"
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-1 scale-90"
          )}
        >
          Theme
        </span>
      </div>
    </div>
  );
});

MacDock.displayName = "MacDock";

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

interface DockItemCommonProps {
  id: string;
  label: string;
  active?: boolean;
  mouseX: number | null;
  isHovered?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  className?: string;
  children: React.ReactNode;
}

const DockItemLink = memo(function DockItemLink({
  label,
  href,
  active,
  mouseX,
  isHovered,
  onHoverStart,
  onHoverEnd,
  className,
  children,
}: DockItemCommonProps & { href: string }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const { scale, translateY } = calculateMagnification(mouseX, ref.current);

  return (
    <Link
      ref={ref}
      href={href}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={cn(
        "relative flex items-center justify-center h-8 w-8 min-[350px]:h-8.5 min-[350px]:w-8.5 min-[400px]:h-9 min-[400px]:w-9 sm:h-9.5 sm:w-9.5 rounded-full cursor-pointer shrink-0",
        "transition-[background-color,color,box-shadow] duration-200 select-none",
        active
          ? "bg-accent/15 text-accent dark:bg-accent-dark/20 dark:text-accent-dark shadow-[0_0_12px_rgba(0,102,204,0.25)] dark:shadow-[0_0_12px_rgba(41,151,255,0.35)]"
          : "text-ink-secondary dark:text-ink-dark-secondary hover:text-ink dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
        className
      )}
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transition: mouseX !== null
          ? "transform 0.08s ease-out"
          : "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transformOrigin: "bottom center",
      }}
      aria-label={label}
    >
      <span className="flex items-center justify-center [&>svg]:w-[16.5px] [&>svg]:h-[16.5px] min-[350px]:[&>svg]:w-[18px] min-[350px]:[&>svg]:h-[18px] min-[400px]:[&>svg]:w-[19px] min-[400px]:[&>svg]:h-[19px] sm:[&>svg]:w-[20px] sm:[&>svg]:h-[20px]">{children}</span>

      {/* Active dot */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent dark:bg-accent-dark animate-pulse shadow-[0_0_6px_currentColor]"
        />
      )}

      {/* Floating tooltip */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-[100]",
          "whitespace-nowrap rounded-md px-2.5 py-1",
          "font-sans text-[11px] font-semibold tracking-tight leading-none",
          "bg-[#161618]/95 text-white dark:bg-[#fbfbfd]/95 dark:text-black",
          "shadow-[0_4px_16px_rgba(0,0,0,0.35)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)]",
          "border border-white/15 dark:border-black/10",
          "backdrop-blur-md",
          "transition-all duration-200 ease-out",
          isHovered
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-1 scale-90"
        )}
      >
        {label}
      </span>
    </Link>
  );
});

const DockItemButton = memo(function DockItemButton({
  label,
  onClick,
  active,
  mouseX,
  isHovered,
  onHoverStart,
  onHoverEnd,
  className,
  children,
}: DockItemCommonProps & { onClick?: (e: React.MouseEvent) => void }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const { scale, translateY } = calculateMagnification(mouseX, ref.current);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={cn(
        "relative flex items-center justify-center h-8 w-8 min-[350px]:h-8.5 min-[350px]:w-8.5 min-[400px]:h-9 min-[400px]:w-9 sm:h-9.5 sm:w-9.5 rounded-full cursor-pointer shrink-0",
        "transition-[background-color,color,box-shadow] duration-200 select-none",
        active
          ? "bg-accent/15 text-accent dark:bg-accent-dark/20 dark:text-accent-dark shadow-[0_0_12px_rgba(0,102,204,0.25)] dark:shadow-[0_0_12px_rgba(41,151,255,0.35)]"
          : "text-ink-secondary dark:text-ink-dark-secondary hover:text-ink dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
        className
      )}
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transition: mouseX !== null
          ? "transform 0.08s ease-out"
          : "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transformOrigin: "bottom center",
      }}
      aria-label={label}
    >
      <span className="flex items-center justify-center [&>svg]:w-[16.5px] [&>svg]:h-[16.5px] min-[350px]:[&>svg]:w-[18px] min-[350px]:[&>svg]:h-[18px] min-[400px]:[&>svg]:w-[19px] min-[400px]:[&>svg]:h-[19px] sm:[&>svg]:w-[20px] sm:[&>svg]:h-[20px]">{children}</span>

      {/* Floating tooltip */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-[100]",
          "whitespace-nowrap rounded-md px-2.5 py-1",
          "font-sans text-[11px] font-semibold tracking-tight leading-none",
          "bg-[#161618]/95 text-white dark:bg-[#fbfbfd]/95 dark:text-black",
          "shadow-[0_4px_16px_rgba(0,0,0,0.35)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)]",
          "border border-white/15 dark:border-black/10",
          "backdrop-blur-md",
          "transition-all duration-200 ease-out",
          isHovered
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-1 scale-90"
        )}
      >
        {label}
      </span>
    </button>
  );
});

export default MacDock;
