"use client";

import { useEffect, useRef, useState } from "react";

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    fetch("/api/visitors", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          console.error("[VisitorCount] API error:", d.error);
        }
        if (typeof d.count === "number" && d.count > 0) {
          setCount(d.count);
        }
      })
      .catch((err) => {
        console.error("[VisitorCount] Fetch failed:", err);
      });
  }, []);

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {count.toLocaleString()} visitors
    </span>
  );
}
