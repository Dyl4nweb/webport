"use client";

import { useEffect, useRef, useState } from "react";

export default function CyberBinaryFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCyber, setIsCyber] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const activeTheme = document.documentElement.getAttribute("data-theme");
      setIsCyber(activeTheme === "cyber");
    };

    checkTheme();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "data-theme") {
          checkTheme();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });
    window.addEventListener("theme:change", checkTheme);
    window.addEventListener("storage", checkTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("theme:change", checkTheme);
      window.removeEventListener("storage", checkTheme);
    };
  }, []);

  useEffect(() => {
    if (!isCyber) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initColumns();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = [];
    const characters = "0100101101000101011010100110100101010100110101";

    function initColumns() {
      columns = Math.floor(width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -40);
      }
    }

    initColumns();

    let lastTime = 0;
    const FRAME_RATE = 38; // Smooth, calm falling speed (~26 FPS)

    function draw(time: number) {
      if (!ctx || !canvas) return;

      if (time - lastTime >= FRAME_RATE) {
        lastTime = time;

        const isDark = document.documentElement.classList.contains("dark");

        // Gentle, calm fade trail without flash
        ctx.fillStyle = isDark
          ? "rgba(3, 7, 5, 0.1)"
          : "rgba(232, 244, 237, 0.12)";
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
        ctx.shadowBlur = 0;

        // Steady calm colors: no random blinking or strobing
        ctx.fillStyle = isDark ? "rgba(0, 255, 102, 0.45)" : "rgba(5, 150, 105, 0.45)";

        for (let i = 0; i < drops.length; i++) {
          const char = characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          if (y > 0 && y < height + fontSize) {
            ctx.fillText(char, x, y);
          }

          if (y > height && Math.random() > 0.985) {
            drops[i] = 0;
          }

          drops[i]++;
        }
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isCyber]);

  if (!isCyber) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-40 transition-opacity duration-700"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Soft CRT scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 dark:opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0, 255, 102, 0.03) 0px, rgba(0, 255, 102, 0.03) 1px, transparent 1px, transparent 3px)",
        }}
      />
    </div>
  );
}
