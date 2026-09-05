"use client";

import { useEffect, useState } from "react";

export default function AdminClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setTime(formatter.format(new Date()));
    };

    updateClock(); // Initial call
    const intervalId = setInterval(updateClock, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Avoid hydration mismatch by not rendering the time until mounted
  if (!time) {
    return (
      <div className="mx-3 mb-2 flex flex-col items-center justify-center rounded-apple-lg border border-line/60 bg-surface-card/60 py-3 px-2 shadow-sm backdrop-blur-md dark:border-line-dark/60 dark:bg-surface-dark-card/60">
        <span className="mb-0.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-accent dark:text-accent-dark">
          Manila, PH
        </span>
        <span className="text-[22px] font-bold tracking-tight text-ink tabular-nums opacity-0 dark:text-ink-dark">
          --:--:-- PM
        </span>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-2 flex flex-col items-center justify-center rounded-apple-lg border border-line/60 bg-surface-card/60 py-3 px-2 shadow-sm backdrop-blur-md dark:border-line-dark/60 dark:bg-surface-dark-card/60">
      <span className="mb-0.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-accent dark:text-accent-dark">
        Manila, PH
      </span>
      <span className="text-[22px] font-bold tracking-tight text-ink tabular-nums dark:text-ink-dark">
        {time}
      </span>
    </div>
  );
}
