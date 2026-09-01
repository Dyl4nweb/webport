"use client";

import { memo, useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SITE } from "@/lib/constants";

interface MacControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  batteryLevel: number | null;
  isCharging: boolean;
}

export const MacControlCenter = memo(function MacControlCenter({
  isOpen,
  onClose,
  batteryLevel,
  isCharging,
}: MacControlCenterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Display Brightness State
  const [brightness, setBrightness] = useState<number>(() => {
    if (typeof window === "undefined") return 100;
    const saved = localStorage.getItem("mac_brightness");
    return saved ? Math.max(25, Math.min(100, Number(saved))) : 100;
  });

  // 2. Sound Volume State
  const [volume, setVolume] = useState<number>(85);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // 3. Quick Toggles State
  const [wifiActive, setWifiActive] = useState(true);
  const [bluetoothActive, setBluetoothActive] = useState(true);
  const [airdropActive, setAirdropActive] = useState(true);
  const [focusActive, setFocusActive] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync theme without heavy MutationObserver DOM overhead
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    window.addEventListener("theme:change", updateTheme);
    window.addEventListener("storage", updateTheme);
    return () => {
      window.removeEventListener("theme:change", updateTheme);
      window.removeEventListener("storage", updateTheme);
    };
  }, []);

  // Update screen brightness overlay & localStorage
  useEffect(() => {
    localStorage.setItem("mac_brightness", String(brightness));
    const overlay = document.getElementById("mac-brightness-overlay");
    if (overlay) {
      // 100% -> opacity 0; 25% -> opacity 0.65
      const dimOpacity = ((100 - brightness) / 100) * 0.72;
      overlay.style.opacity = String(dimOpacity);
    }
  }, [brightness]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-control-center-trigger]")
      ) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const toggleTheme = useCallback(() => {
    const toggleBtn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
    if (toggleBtn) {
      toggleBtn.click();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Control Center"
      className={cn(
        "fixed right-3 top-9 z-50 w-[320px] rounded-2xl p-3 select-none",
        "bg-[#f6f6f6]/80 dark:bg-[#1e1e20]/80",
        "border border-black/[0.12] dark:border-white/[0.16]",
        "backdrop-blur-2xl [-webkit-backdrop-filter:blur(30px)]",
        "shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)]",
        "animate-in fade-in zoom-in-95 duration-150 ease-out"
      )}
    >
      <div className="flex flex-col gap-2.5">
        {/* Top Grid: Connectivity & Focus */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Connectivity Group */}
          <div className="flex flex-col gap-2 rounded-xl bg-white/70 dark:bg-white/[0.08] p-2.5 shadow-sm">
            {/* Wi-Fi */}
            <button
              type="button"
              onClick={() => setWifiActive((prev) => !prev)}
              className="flex items-center gap-2.5 text-left group"
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  wifiActive
                    ? "bg-[#007AFF] text-white shadow-sm"
                    : "bg-black/10 dark:bg-white/10 text-ink/70 dark:text-ink-dark/70"
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[12px] font-semibold text-ink dark:text-ink-dark">Wi-Fi</span>
                <span className="text-[10px] text-ink-secondary/70 dark:text-ink-dark-secondary/70 truncate max-w-[80px]">
                  {wifiActive ? "Dylan-5G" : "Off"}
                </span>
              </div>
            </button>

            {/* Bluetooth */}
            <button
              type="button"
              onClick={() => setBluetoothActive((prev) => !prev)}
              className="flex items-center gap-2.5 text-left group"
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  bluetoothActive
                    ? "bg-[#007AFF] text-white shadow-sm"
                    : "bg-black/10 dark:bg-white/10 text-ink/70 dark:text-ink-dark/70"
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[12px] font-semibold text-ink dark:text-ink-dark">Bluetooth</span>
                <span className="text-[10px] text-ink-secondary/70 dark:text-ink-dark-secondary/70 truncate max-w-[80px]">
                  {bluetoothActive ? "AirPods Pro" : "Off"}
                </span>
              </div>
            </button>

            {/* AirDrop */}
            <button
              type="button"
              onClick={() => setAirdropActive((prev) => !prev)}
              className="flex items-center gap-2.5 text-left group"
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  airdropActive
                    ? "bg-[#007AFF] text-white shadow-sm"
                    : "bg-black/10 dark:bg-white/10 text-ink/70 dark:text-ink-dark/70"
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 7l-5-5-5 5M17 17l-5 5-5-5" />
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[12px] font-semibold text-ink dark:text-ink-dark">AirDrop</span>
                <span className="text-[10px] text-ink-secondary/70 dark:text-ink-dark-secondary/70 truncate max-w-[80px]">
                  {airdropActive ? "Everyone" : "Off"}
                </span>
              </div>
            </button>
          </div>

          {/* Right Column: Focus & Dark Mode */}
          <div className="flex flex-col gap-2.5">
            {/* Focus / Do Not Disturb */}
            <button
              type="button"
              onClick={() => setFocusActive((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl bg-white/70 dark:bg-white/[0.08] p-2.5 shadow-sm text-left group transition-all"
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                  focusActive
                    ? "bg-[#5856D6] text-white shadow-sm"
                    : "bg-black/10 dark:bg-white/10 text-ink/70 dark:text-ink-dark/70"
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[12px] font-semibold text-ink dark:text-ink-dark">Focus</span>
                <span className="text-[10px] text-ink-secondary/70 dark:text-ink-dark-secondary/70">
                  {focusActive ? "Do Not Disturb" : "Off"}
                </span>
              </div>
            </button>

            {/* Dark Mode Quick Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2.5 rounded-xl bg-white/70 dark:bg-white/[0.08] p-2.5 shadow-sm text-left group transition-all"
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
                  isDark
                    ? "bg-[#007AFF] text-white shadow-sm"
                    : "bg-black/10 dark:bg-white/10 text-ink/70 dark:text-ink-dark/70"
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18" />
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[12px] font-semibold text-ink dark:text-ink-dark">Dark Mode</span>
                <span className="text-[10px] text-ink-secondary/70 dark:text-ink-dark-secondary/70">
                  {isDark ? "On" : "Off"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Display Brightness Slider (Working Screen Dimmer) */}
        <div className="flex flex-col gap-1.5 rounded-xl bg-white/70 dark:bg-white/[0.08] p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-medium text-ink/80 dark:text-ink-dark/80">
            <span className="font-semibold">Display</span>
            <span className="font-mono text-[10px] text-ink-secondary/70 dark:text-ink-dark-secondary/70">{brightness}%</span>
          </div>

          <div className="relative flex h-7 w-full items-center rounded-lg bg-black/10 dark:bg-black/40 overflow-hidden p-0.5">
            {/* Filled Track */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white dark:bg-white/90 rounded-md transition-all duration-75 shadow-sm"
              style={{ width: `${brightness}%` }}
            />
            {/* Sun Icon inside track */}
            <div className="relative z-10 pl-2 text-ink-secondary dark:text-ink-dark-secondary pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            {/* Range Input Slider */}
            <input
              type="range"
              min="25"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              aria-label="Display Brightness"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
            />
          </div>
        </div>

        {/* Sound Volume Slider */}
        <div className="flex flex-col gap-1.5 rounded-xl bg-white/70 dark:bg-white/[0.08] p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-medium text-ink/80 dark:text-ink-dark/80">
            <span className="font-semibold">Sound</span>
            <span className="font-mono text-[10px] text-ink-secondary/70 dark:text-ink-dark-secondary/70">{volume}%</span>
          </div>

          <div className="relative flex h-7 w-full items-center rounded-lg bg-black/10 dark:bg-black/40 overflow-hidden p-0.5">
            {/* Filled Track */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white dark:bg-white/90 rounded-md transition-all duration-75 shadow-sm"
              style={{ width: `${volume}%` }}
            />
            {/* Speaker Icon inside track */}
            <div className="relative z-10 pl-2 text-ink-secondary dark:text-ink-dark-secondary pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </div>
            {/* Range Input Slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Sound Volume"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
            />
          </div>
        </div>

        {/* Now Playing Widget */}
        <div className="flex items-center gap-3 rounded-xl bg-white/70 dark:bg-white/[0.08] p-2.5 shadow-sm">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-black/10 dark:border-white/10 bg-surface-alt dark:bg-surface-dark-alt">
            <Image
              src="/icon.png"
              alt="Cover Art"
              width={40}
              height={40}
              className="h-full w-full object-contain p-1"
            />
          </div>
          <div className="flex flex-col leading-tight min-w-0 flex-1">
            <span className="text-[12px] font-semibold text-ink dark:text-ink-dark truncate">
              {SITE.name}
            </span>
            <span className="text-[10px] text-ink-secondary/70 dark:text-ink-dark-secondary/70 truncate">
              Full Stack Engineer • Portfolio
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-ink dark:text-ink-dark transition-colors"
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
        </div>

        {/* Battery Meta Footer */}
        <div className="flex items-center justify-between px-1 text-[11px] text-ink-secondary/60 dark:text-ink-dark-secondary/60 font-medium">
          <span>Battery Status</span>
          <span className="flex items-center gap-1.5">
            {isCharging && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
              </svg>
            )}
            <span className="font-mono">{batteryLevel !== null ? `${batteryLevel}%` : "100%"}</span>
            <span>• Normal Power</span>
          </span>
        </div>
      </div>
    </div>
  );
});

export default MacControlCenter;
