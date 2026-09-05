"use client";

import { memo, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SITE } from "@/lib/constants";
import MacControlCenter from "./MacControlCenter";

export const MacMenuBar = memo(function MacMenuBar() {
  const pathname = usePathname();
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [timeStr, setTimeStr] = useState<string>("");
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const appleMenuRef = useRef<HTMLDivElement>(null);

  // 1. Live Clock Format: "Tue Sep 1  6:30 PM"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      // Format as "Tue Sep 1  6:30 PM"
      const formatted = now
        .toLocaleString("en-US", options)
        .replace(/,/g, "")
        .replace(/(\d+)\s+at/, "$1 ");
      setTimeStr(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 15);
    return () => clearInterval(interval);
  }, []);

  // 2. Battery API with fallback
  useEffect(() => {
    let batteryInstance: any = null;

    const handleBatteryUpdate = (battery: any) => {
      setBatteryLevel(Math.round(battery.level * 100));
      setIsCharging(battery.charging);
    };

    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        handleBatteryUpdate(battery);
        battery.addEventListener("levelchange", () => handleBatteryUpdate(battery));
        battery.addEventListener("chargingchange", () => handleBatteryUpdate(battery));
      }).catch(() => {
        setBatteryLevel(98);
        setIsCharging(true);
      });
    } else {
      setBatteryLevel(98);
      setIsCharging(false);
    }
  }, []);

  // 3. Click outside Apple menu
  useEffect(() => {
    if (!appleMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (appleMenuRef.current && !appleMenuRef.current.contains(e.target as Node)) {
        setAppleMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [appleMenuOpen]);

  const toggleControlCenter = useCallback(() => {
    setControlCenterOpen((prev) => !prev);
    setAppleMenuOpen(false);
  }, []);

  const openAIChat = useCallback(() => {
    window.dispatchEvent(new CustomEvent("aichat:toggle"));
  }, []);

  return (
    <>
      {/* Fixed Desktop macOS Top Menu Bar */}
      <header
        aria-label="macOS Menu Bar"
        className={cn(
          "fixed top-0 left-0 right-0 z-40 h-7 select-none items-center justify-between px-3 text-[13px] font-medium leading-none",
          "hidden md:flex",
          "bg-surface/85 dark:bg-surface-dark/85",
          "border-b border-line/50 dark:border-line-dark/50",
          "backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)]",
          "text-ink/90 dark:text-ink-dark/90",
          "transition-[background-color,border-color] duration-300"
        )}
      >
        {/* Left: Apple / Logo + Menus */}
        <div className="flex items-center gap-4">
          {/* Apple / Dylan Icon Menu */}
          <div ref={appleMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setAppleMenuOpen((prev) => !prev)}
              aria-label="Apple Menu"
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded px-1 transition-colors",
                appleMenuOpen
                  ? "bg-black/10 dark:bg-white/15"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              <Image
                src="/icon.png"
                alt="Logo"
                width={14}
                height={14}
                className="h-3.5 w-3.5 object-contain"
              />
            </button>

            {/* Apple Dropdown Menu */}
            {appleMenuOpen && (
              <div
                className={cn(
                  "absolute left-0 top-6 z-50 w-56 rounded-xl p-1.5 shadow-2xl",
                  "bg-[#f6f6f6]/90 dark:bg-[#1e1e20]/90",
                  "border border-black/[0.12] dark:border-white/[0.16]",
                  "backdrop-blur-2xl [-webkit-backdrop-filter:blur(30px)]",
                  "text-[12.5px] font-normal text-ink dark:text-ink-dark",
                  "animate-in fade-in zoom-in-95 duration-100 ease-out"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAppleMenuOpen(false);
                    window.location.href = "/about";
                  }}
                  className="w-full flex items-center px-2.5 py-1 rounded-md text-left hover:bg-[#007AFF] hover:text-white transition-colors"
                >
                  About This Portfolio
                </button>
                <div className="my-1 h-[1px] bg-black/10 dark:bg-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setAppleMenuOpen(false);
                    window.location.href = "/projects";
                  }}
                  className="w-full flex items-center px-2.5 py-1 rounded-md text-left hover:bg-[#007AFF] hover:text-white transition-colors"
                >
                  System Projects...
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppleMenuOpen(false);
                    window.location.href = "/experience";
                  }}
                  className="w-full flex items-center px-2.5 py-1 rounded-md text-left hover:bg-[#007AFF] hover:text-white transition-colors"
                >
                  Career Journey...
                </button>
                <div className="my-1 h-[1px] bg-black/10 dark:bg-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setAppleMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full flex items-center px-2.5 py-1 rounded-md text-left hover:bg-[#007AFF] hover:text-white transition-colors"
                >
                  Restart Scroll Position
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppleMenuOpen(false);
                    window.location.href = "/";
                  }}
                  className="w-full flex items-center px-2.5 py-1 rounded-md text-left hover:bg-[#007AFF] hover:text-white transition-colors text-red-500 hover:text-white"
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>

          {/* App Title & Standard Menus */}
          <span className="font-semibold text-ink dark:text-ink-dark">
            Dylan OS
          </span>

          <nav className="flex items-center gap-3 text-[12.5px] text-ink-secondary/80 dark:text-ink-dark-secondary/80">
            <Link
              href="/projects"
              className="hover:text-ink dark:hover:text-ink-dark px-1 py-0.5 rounded transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/experience"
              className="hover:text-ink dark:hover:text-ink-dark px-1 py-0.5 rounded transition-colors"
            >
              Experience
            </Link>
            <Link
              href={
                pathname === "/about" || pathname?.startsWith("/about/")
                  ? "/certifications?from=about"
                  : pathname === "/"
                  ? "/certifications?from=home"
                  : "/certifications"
              }
              className="hover:text-ink dark:hover:text-ink-dark px-1 py-0.5 rounded transition-colors"
            >
              Certifications
            </Link>
            <Link
              href="/contact"
              className="hover:text-ink dark:hover:text-ink-dark px-1 py-0.5 rounded transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Right Status Tray */}
        <div className="flex items-center gap-3 text-[12px]">
          {/* Live Battery Indicator */}
          <div
            className="flex items-center gap-1.5 cursor-pointer px-1 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={isCharging ? "Battery: Charging" : `Battery: ${batteryLevel ?? 100}%`}
            onClick={toggleControlCenter}
          >
            <span className="font-mono text-[11px] text-ink-secondary/90 dark:text-ink-dark-secondary/90">
              {batteryLevel !== null ? `${batteryLevel}%` : "100%"}
            </span>

            {/* Battery Icon */}
            <div className="relative flex h-[11px] w-[20px] items-center rounded-[3px] border border-ink/60 dark:border-ink-dark/60 p-[1.5px]">
              {/* Battery Fill Level */}
              <div
                className={cn(
                  "h-full rounded-[1.5px] transition-all duration-300",
                  isCharging
                    ? "bg-emerald-500"
                    : (batteryLevel ?? 100) <= 20
                    ? "bg-red-500"
                    : "bg-ink/85 dark:bg-ink-dark/85"
                )}
                style={{ width: `${Math.min(100, Math.max(8, batteryLevel ?? 98))}%` }}
              />
              {/* Terminal Cap */}
              <span className="absolute -right-[3px] top-[2.5px] h-[4px] w-[2px] rounded-r-sm bg-ink/60 dark:bg-ink-dark/60" />
            </div>

            {/* Charging Lightning Bolt */}
            {isCharging && (
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-emerald-500 -ml-0.5"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            )}
          </div>

          {/* Wi-Fi Icon */}
          <button
            type="button"
            onClick={toggleControlCenter}
            aria-label="Wi-Fi Status"
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-ink-secondary/90 dark:text-ink-dark-secondary/90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" />
            </svg>
          </button>

          {/* Spotlight / Varex AI Assistant Icon */}
          <button
            type="button"
            onClick={openAIChat}
            aria-label="Search / Varex AI Assistant"
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-ink-secondary/90 dark:text-ink-dark-secondary/90"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* macOS Control Center Icon */}
          <button
            type="button"
            data-control-center-trigger
            onClick={toggleControlCenter}
            aria-label="Control Center"
            className={cn(
              "p-1 rounded transition-colors text-ink-secondary/90 dark:text-ink-dark-secondary/90",
              controlCenterOpen
                ? "bg-black/10 dark:bg-white/20 text-ink dark:text-ink-dark"
                : "hover:bg-black/5 dark:hover:bg-white/10"
            )}
          >
            {/* 2 stacked sliders icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="6" rx="3" />
              <circle cx="7" cy="7" r="1.5" fill="currentColor" />
              <rect x="2" y="14" width="20" height="6" rx="3" />
              <circle cx="17" cy="17" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {/* Live Clock / Date */}
          <span className="font-sans text-[13px] sm:text-[15px] font-bold tracking-tight text-ink dark:text-ink-dark pl-1">
            {timeStr || "Loading..."}
          </span>
        </div>
      </header>

      {/* Interactive Control Center Dropdown */}
      <MacControlCenter
        isOpen={controlCenterOpen}
        onClose={() => setControlCenterOpen(false)}
        batteryLevel={batteryLevel}
        isCharging={isCharging}
      />
    </>
  );
});

export default MacMenuBar;
