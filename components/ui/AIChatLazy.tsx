"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AIChat = dynamic(() => import("./AIChat"), { ssr: false });

export default function AIChatLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;
  return (
    <div className="public-chat">
      <AIChat />
    </div>
  );
}
