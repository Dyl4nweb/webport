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
      <div className="flex h-9 items-center justify-between px-3">
        <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
          PH Time
        </span>
        <span className="text-[13px] font-medium text-ink dark:text-ink-dark opacity-0">
          --:--:--
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-9 items-center justify-between px-3">
      <span className="text-[13px] font-medium text-ink-secondary dark:text-ink-dark-secondary">
        PH Time
      </span>
      <span className="text-[13px] font-medium text-ink dark:text-ink-dark tabular-nums tracking-tight">
        {time}
      </span>
    </div>
  );
}
