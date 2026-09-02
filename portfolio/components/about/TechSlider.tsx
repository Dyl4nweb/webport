"use client";

import { useMemo } from "react";
import Link from "next/link";
import TechIcon from "@/components/ui/TechIcon";
import Container from "@/components/ui/Container";

const SLIDER_ICONS = [
  { name: "Next.js", label: "Next.js" },
  { name: "TypeScript", label: "TypeScript" },
  { name: "React", label: "React" },
  { name: "Tailwind CSS", label: "Tailwind CSS" },
  { name: "React Native", label: "React Native" },
  { name: "JavaScript", label: "JavaScript" },
  { name: "HTML", label: "HTML5" },
  { name: "CSS", label: "CSS3" },
  { name: "Flutter", label: "Flutter" },
  { name: "Dart", label: "Dart" },
  { name: "Node.js", label: "Node.js" },
  { name: "Supabase", label: "Supabase" },
  { name: "PostgreSQL", label: "PostgreSQL" },
  { name: "MongoDB", label: "MongoDB" },
  { name: "Prisma", label: "Prisma" },
  { name: "SQL", label: "SQL" },
  { name: "REST APIs", label: "REST APIs" },
  { name: "Docker", label: "Docker" },
  { name: "Git", label: "Git" },
  { name: "GitHub", label: "GitHub" },
  { name: "Visual Studio Code", label: "VS Code" },
  { name: "Vercel", label: "Vercel" },
  { name: "Expo Go", label: "Expo" },
  { name: "Netlify", label: "Netlify" },
  { name: "Resend", label: "Resend" },
  { name: "Gemini AI API", label: "Gemini AI" },
  { name: "OpenAI API", label: "OpenAI" },
  { name: "Opencode API", label: "Terminal / Code" },
];

export default function TechSlider() {
  const trackItems = useMemo(
    () => [...SLIDER_ICONS, ...SLIDER_ICONS, ...SLIDER_ICONS],
    []
  );

  return (
    <div className="w-full py-6 sm:py-8 overflow-hidden">
      <Container>
        <div
          className="group relative flex w-full overflow-hidden select-none py-2 [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]"
          aria-label="Technologies and tools sliding marquee"
        >
          <div
            className="flex shrink-0 items-center gap-5 sm:gap-8 md:gap-10 pr-5 sm:pr-8 md:pr-10 animate-marquee-left will-change-transform group-hover:[animation-play-state:paused]"
            style={{ animationDuration: "50s" }}
          >
            {trackItems.map((tech, idx) => (
              <Link
                key={`track1-${tech.name}-${idx}`}
                href="/tech-stack"
                title={tech.label}
                className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all duration-200 hover:scale-125 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                <TechIcon
                  name={tech.name}
                  size={24}
                  className="sm:w-[28px] sm:h-[28px] transition-transform duration-200"
                />
              </Link>
            ))}
          </div>

          <div
            className="flex shrink-0 items-center gap-5 sm:gap-8 md:gap-10 pr-5 sm:pr-8 md:pr-10 animate-marquee-left will-change-transform group-hover:[animation-play-state:paused]"
            style={{ animationDuration: "50s" }}
            aria-hidden="true"
          >
            {trackItems.map((tech, idx) => (
              <Link
                key={`track2-${tech.name}-${idx}`}
                href="/tech-stack"
                title={tech.label}
                tabIndex={-1}
                className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all duration-200 hover:scale-125 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                <TechIcon
                  name={tech.name}
                  size={24}
                  className="sm:w-[28px] sm:h-[28px] transition-transform duration-200"
                />
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
