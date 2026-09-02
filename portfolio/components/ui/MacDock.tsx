"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LiveAIFace from "@/components/ui/LiveAIFace";

const DOCK_ICONS: Record<string, React.ReactNode> = {
  "/about": (
    <div className="relative flex items-center justify-center w-[27px] h-[27px] min-[380px]:w-[30px] min-[380px]:h-[30px] sm:w-[33px] sm:h-[33px] md:w-[36px] md:h-[36px] rounded-[7px] min-[380px]:rounded-[8px] sm:rounded-[9px] md:rounded-[10px] bg-gradient-to-b from-[#475569] via-[#334155] to-[#1E293B] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] border border-white/20 dark:border-white/15 overflow-hidden shrink-0 select-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/25 before:via-white/5 before:to-transparent before:pointer-events-none">
      <Image
        src="/images/emoji/user-silhouette.png"
        alt="About"
        width={40}
        height={40}
        className="w-[17px] h-[17px] min-[380px]:w-[19px] min-[380px]:h-[19px] sm:w-[21px] sm:h-[21px] md:w-[23px] md:h-[23px] object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] select-none pointer-events-none transition-transform duration-200"
        priority
      />
    </div>
  ),
  "/projects": (
    <div className="relative flex items-center justify-center w-[27px] h-[27px] min-[380px]:w-[30px] min-[380px]:h-[30px] sm:w-[33px] sm:h-[33px] md:w-[36px] md:h-[36px] rounded-[7px] min-[380px]:rounded-[8px] sm:rounded-[9px] md:rounded-[10px] bg-gradient-to-b from-[#5c3116] via-[#3d1f0d] to-[#241207] shadow-[0_2px_8px_rgba(61,31,13,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] border border-amber-500/25 dark:border-amber-400/20 overflow-hidden shrink-0 select-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/25 before:via-white/5 before:to-transparent before:pointer-events-none">
      <Image
        src="/images/emoji/briefcase.png"
        alt="Projects"
        width={40}
        height={40}
        className="w-[17px] h-[17px] min-[380px]:w-[19px] min-[380px]:h-[19px] sm:w-[21px] sm:h-[21px] md:w-[23px] md:h-[23px] object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] select-none pointer-events-none transition-transform duration-200"
        priority
      />
    </div>
  ),
  "/contact": (
    <div className="relative flex items-center justify-center w-[27px] h-[27px] min-[380px]:w-[30px] min-[380px]:h-[30px] sm:w-[33px] sm:h-[33px] md:w-[36px] md:h-[36px] rounded-[7px] min-[380px]:rounded-[8px] sm:rounded-[9px] md:rounded-[10px] bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#0369A1] shadow-[0_2px_8px_rgba(2,132,199,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] border border-sky-300/35 dark:border-sky-300/25 overflow-hidden shrink-0 select-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:via-white/5 before:to-transparent before:pointer-events-none">
      <Image
        src="/images/emoji/envelope.png"
        alt="Contact"
        width={40}
        height={40}
        className="w-[17px] h-[17px] min-[380px]:w-[19px] min-[380px]:h-[19px] sm:w-[21px] sm:h-[21px] md:w-[23px] md:h-[23px] object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] select-none pointer-events-none transition-transform duration-200"
        priority
      />
    </div>
  ),
};

const NAV_PAGES = [
  { id: "about", label: "About", href: "/about" },
  { id: "projects", label: "Projects", href: "/projects" },
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
  const [activeRevealedId, setActiveRevealedId] = useState<string | null>(null);
  const touchFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<HTMLDivElement | null>(null);

  // Pure Back to Top: Always smoothly scrolls to y=0 of the current page
  const scrollToTop = useCallback(() => {
    performSmoothScrollToTop();
  }, []);

  // When user opens/navigates to a page, briefly reveal its label indicator (e.g. Home, About, Projects, Contact)
  useEffect(() => {
    let currentId: string | null = null;
    if (pathname === "/") currentId = "logo";
    else if (pathname === "/about") currentId = "about";
    else if (pathname === "/projects") currentId = "projects";
    else if (pathname === "/contact") currentId = "contact";

    if (currentId) {
      setActiveRevealedId(currentId);
      const timer = setTimeout(() => {
        setActiveRevealedId(null);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Touch trigger on mobile: reveals label immediately, stays visible for 1.8s
  const handleTouchItem = useCallback((id: string) => {
    if (touchFadeTimeoutRef.current) clearTimeout(touchFadeTimeoutRef.current);
    setHoveredId(id);
    touchFadeTimeoutRef.current = setTimeout(() => {
      setHoveredId(null);
    }, 1800);
  }, []);

  // D Logo: Navigates to Home if on subpage, or smoothly scrolls up if on Home
  const handleLogoClick = useCallback(() => {
    if (pathname === "/") {
      performSmoothScrollToTop();
    } else {
      router.push("/");
    }
  }, [pathname, router]);

  const dockRafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const clientX = e.clientX;
    if (dockRafRef.current) cancelAnimationFrame(dockRafRef.current);
    dockRafRef.current = requestAnimationFrame(() => {
      setMouseX(clientX);
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (dockRafRef.current) cancelAnimationFrame(dockRafRef.current);
    setMouseX(null);
    setHoveredId(null);
  }, []);

  // Touch move on dock: sliding finger previews the label under touch
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dockItem = el?.closest("[data-dock-id]");
    if (dockItem) {
      const id = dockItem.getAttribute("data-dock-id");
      if (id) handleTouchItem(id);
    }
  }, [handleTouchItem]);

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
      onTouchMove={handleTouchMove}
      className={cn(
        "relative inline-flex items-center rounded-full",
        "gap-1 min-[380px]:gap-1.5 sm:gap-2 md:gap-2",
        "px-2 min-[380px]:px-2.5 sm:px-3 md:px-3.5",
        "py-1.5 sm:py-1.5 md:py-2",
        "bg-white/95 dark:bg-[#161618]/95",
        "border border-black/[0.09] dark:border-white/[0.14]",
        "backdrop-blur-2xl [-webkit-backdrop-filter:blur(24px)]",
        "shadow-[0_6px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]",
        "dark:shadow-[0_8px_28px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.3)]",
        "md:shadow-[0_10px_32px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.05)]",
        "dark:md:shadow-[0_12px_36px_rgba(0,0,0,0.6),0_1px_3px_rgba(0,0,0,0.35)]",
        "transition-[background-color,border-color,box-shadow] duration-300",
        "overflow-visible isolate transform-gpu [transform:translateZ(0)] [-webkit-backface-visibility:hidden]"
      )}
    >
      {/* 1. Home Brand Logo */}
      <DockItemButton
        id="logo"
        label="Home"
        onClick={handleLogoClick}
        mouseX={mouseX}
        isHovered={hoveredId === "logo"}
        isRevealed={activeRevealedId === "logo"}
        onHoverStart={() => setHoveredId("logo")}
        onHoverEnd={() => setHoveredId(null)}
        onTouchStart={() => handleTouchItem("logo")}
        active={pathname === "/"}
      >
        <Image
          id="navbar-logo-dock"
          src="/icon.png"
          alt={SITE.name}
          width={40}
          height={40}
          priority
          className="w-[27px] h-[27px] min-[380px]:w-[30px] min-[380px]:h-[30px] sm:w-[33px] sm:h-[33px] md:w-[36px] md:h-[36px] rounded-[7px] min-[380px]:rounded-[8px] sm:rounded-[9px] md:rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.35)] border border-white/20 dark:border-white/15 object-contain navbar-logo-target select-none pointer-events-none transition-transform duration-200"
        />
      </DockItemButton>

      {/* Divider */}
      <span
        aria-hidden="true"
        className="h-3 min-[380px]:h-3.5 sm:h-4 md:h-4.5 w-[1px] bg-black/[0.12] dark:bg-white/[0.16] shrink-0 self-center opacity-80"
      />

      {/* 2. Main Navigation Links (About, Projects, Contact) */}
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
            isRevealed={activeRevealedId === page.id}
            onHoverStart={() => setHoveredId(page.id)}
            onHoverEnd={() => setHoveredId(null)}
            onTouchStart={() => handleTouchItem(page.id)}
          >
            {DOCK_ICONS[page.href]}
          </DockItemLink>
        );
      })}

      {/* Divider */}
      <span
        aria-hidden="true"
        className="h-3 min-[380px]:h-3.5 sm:h-4 md:h-4.5 w-[1px] bg-black/[0.12] dark:bg-white/[0.16] shrink-0 self-center opacity-80"
      />

      {/* 3. Theme Toggle Button */}
      <div
        ref={themeRef}
        data-dock-id="theme"
        onMouseEnter={() => setHoveredId("theme")}
        onMouseLeave={() => setHoveredId(null)}
        onTouchStart={() => handleTouchItem("theme")}
        className="relative flex items-center justify-center origin-center shrink-0 w-[32px] h-[32px] min-[380px]:w-[35px] min-[380px]:h-[35px] sm:w-[39px] sm:h-[39px] md:w-[43px] md:h-[43px]"
        style={{
          transform: `scale(${themeScale}) translateY(${themeTranslateY}px)`,
          transition: mouseX !== null
            ? "transform 0.08s ease-out"
            : "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformOrigin: "bottom center",
        }}
      >
        <ThemeToggle className="w-full h-full" />

        {/* Floating Tooltip — Works on both Desktop and Mobile Touch */}
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex absolute -top-8 md:-top-9 left-1/2 -translate-x-1/2 pointer-events-none z-[100]",
            "items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1",
            "font-sans text-[11px] md:text-[11.5px] font-medium tracking-normal leading-none",
            "bg-[#18181b]/95 text-[#f4f4f5] dark:bg-[#f4f4f6]/95 dark:text-[#18181b]",
            "shadow-[0_4px_16px_rgba(0,0,0,0.35)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)]",
            "border border-white/15 dark:border-black/10",
            "backdrop-blur-md",
            "transition-all duration-200 ease-out",
            hoveredId === "theme" || activeRevealedId === "theme"
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-1 scale-90 pointer-events-none"
          )}
        >
          Theme
        </span>
      </div>

      {/* 4. Varex AI Assistant */}
      <DockItemButton
        id="aichat"
        label="Varex AI"
        onClick={toggleChat}
        mouseX={mouseX}
        isHovered={hoveredId === "aichat"}
        isRevealed={activeRevealedId === "aichat"}
        onHoverStart={() => setHoveredId("aichat")}
        onHoverEnd={() => setHoveredId(null)}
        onTouchStart={() => handleTouchItem("aichat")}
        active={false}
      >
        <span className="flex items-center justify-center">
          <LiveAIFace
            size={16}
            className="min-[380px]:hidden"
            isHovered={hoveredId === "aichat"}
          />
          <LiveAIFace
            size={17}
            className="hidden min-[380px]:inline-flex sm:hidden"
            isHovered={hoveredId === "aichat"}
          />
          <LiveAIFace
            size={19}
            className="hidden sm:inline-flex md:hidden"
            isHovered={hoveredId === "aichat"}
          />
          <LiveAIFace
            size={21}
            className="hidden md:inline-flex"
            isHovered={hoveredId === "aichat"}
          />
        </span>
      </DockItemButton>

      {/* 5. Back to top */}
      <DockItemButton
        id="backtotop"
        label="Back to top"
        onClick={scrollToTop}
        mouseX={mouseX}
        isHovered={hoveredId === "backtotop"}
        isRevealed={activeRevealedId === "backtotop"}
        onHoverStart={() => setHoveredId("backtotop")}
        onHoverEnd={() => setHoveredId(null)}
        onTouchStart={() => handleTouchItem("backtotop")}
        active={false}
      >
        <svg
          width="20"
          height="20"
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
  isRevealed?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onTouchStart?: () => void;
  className?: string;
  children: React.ReactNode;
}

const DockItemLink = memo(function DockItemLink({
  id,
  label,
  href,
  active,
  mouseX,
  isHovered,
  isRevealed,
  onHoverStart,
  onHoverEnd,
  onTouchStart,
  className,
  children,
}: DockItemCommonProps & { href: string }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const { scale, translateY } = calculateMagnification(mouseX, ref.current);
  const isVisible = Boolean(isHovered || isRevealed);

  return (
    <Link
      ref={ref}
      href={href}
      data-dock-id={id}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onTouchStart={onTouchStart}
      className={cn(
        "relative flex items-center justify-center",
        "w-[32px] h-[32px] min-[380px]:w-[35px] min-[380px]:h-[35px] sm:w-[39px] sm:h-[39px] md:w-[43px] md:h-[43px]",
        "rounded-full cursor-pointer shrink-0",
        "transition-[color,transform] duration-200 select-none",
        className
      )}
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transition: mouseX !== null
          ? "transform 0.08s ease-out"
          : "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transformOrigin: "bottom center",
        willChange: mouseX !== null ? "transform" : "auto",
      }}
      aria-label={label}
    >
      <span className="flex items-center justify-center transition-transform duration-200">{children}</span>

      {/* Active running dot */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-accent dark:bg-accent-dark shadow-[0_0_6px_currentColor]"
        />
      )}

      {/* Floating Tooltip — Works on both Desktop and Mobile Touch */}
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex absolute -top-8 md:-top-9 left-1/2 -translate-x-1/2 pointer-events-none z-[100]",
          "items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1",
          "font-sans text-[11px] md:text-[11.5px] font-medium tracking-normal leading-none",
          "bg-[#18181b]/95 text-[#f4f4f5] dark:bg-[#f4f4f6]/95 dark:text-[#18181b]",
          "shadow-[0_4px_16px_rgba(0,0,0,0.35)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)]",
          "border border-white/15 dark:border-black/10",
          "backdrop-blur-md",
          "transition-all duration-200 ease-out",
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-1 scale-90 pointer-events-none"
        )}
      >
        {label}
      </span>
    </Link>
  );
});

const DockItemButton = memo(function DockItemButton({
  id,
  label,
  onClick,
  active,
  mouseX,
  isHovered,
  isRevealed,
  onHoverStart,
  onHoverEnd,
  onTouchStart,
  className,
  children,
}: DockItemCommonProps & { onClick?: (e: React.MouseEvent) => void }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const { scale, translateY } = calculateMagnification(mouseX, ref.current);
  const isVisible = Boolean(isHovered || isRevealed);

  return (
    <button
      ref={ref}
      type="button"
      data-dock-id={id}
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onTouchStart={onTouchStart}
      className={cn(
        "relative flex items-center justify-center",
        "w-[32px] h-[32px] min-[380px]:w-[35px] min-[380px]:h-[35px] sm:w-[39px] sm:h-[39px] md:w-[43px] md:h-[43px]",
        "rounded-full cursor-pointer shrink-0",
        "transition-[background-color,color,box-shadow,transform] duration-200 select-none",
        active
          ? "text-accent dark:text-accent-dark"
          : "text-ink-secondary dark:text-ink-dark-secondary hover:text-ink dark:hover:text-ink-dark hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
        className
      )}
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transition: mouseX !== null
          ? "transform 0.08s ease-out"
          : "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transformOrigin: "bottom center",
        willChange: mouseX !== null ? "transform" : "auto",
      }}
      aria-label={label}
    >
      <span className="flex items-center justify-center transition-transform duration-200">{children}</span>

      {/* Active running dot */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-accent dark:bg-accent-dark shadow-[0_0_6px_currentColor]"
        />
      )}

      {/* Floating Tooltip — Works on both Desktop and Mobile Touch */}
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex absolute -top-8 md:-top-9 left-1/2 -translate-x-1/2 pointer-events-none z-[100]",
          "items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1",
          "font-sans text-[11px] md:text-[11.5px] font-medium tracking-normal leading-none",
          "bg-[#18181b]/95 text-[#f4f4f5] dark:bg-[#f4f4f6]/95 dark:text-[#18181b]",
          "shadow-[0_4px_16px_rgba(0,0,0,0.35)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)]",
          "border border-white/15 dark:border-black/10",
          "backdrop-blur-md",
          "transition-all duration-200 ease-out",
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-1 scale-90 pointer-events-none"
        )}
      >
        {label}
      </span>
    </button>
  );
});

export default MacDock;
