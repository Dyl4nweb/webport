import { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "motus",
    name: "Motus",
    tagline: "Movement tracking, reimagined.",
    description:
      "A fitness analytics platform that turns raw workout data into a coaching voice athletes actually trust.",
    problem:
      "Amateur athletes had data from a dozen apps and insight from none of them. Every dashboard reported numbers; nothing explained what to do next.",
    solution:
      "Motus unifies wearable data into a single training model, then surfaces one clear recommendation a day instead of forty charts. The interface was built to disappear — the guidance is the product.",
    role: "Lead Product Engineer",
    year: "2026 — Present",
    image: "/images/projects/motus.png",
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Vercel"],
    liveUrl: "https://motus.app",
    repoUrl: "https://github.com/alexrivera/motus",
    featured: true,
    metrics: [
      { label: "Weekly active athletes", value: "12,400+" },
      { label: "Median load time", value: "0.4s" },
      { label: "Retention lift", value: "+38%" },
    ],
  },
  {
    slug: "varex-ai",
    name: "Varex AI",
    tagline: "An assistant for people who read contracts for a living.",
    description:
      "An AI-assisted document review tool that helps legal teams find risk in minutes instead of days.",
    problem:
      "Reviewing commercial contracts is slow, repetitive, and error-prone under deadline pressure. Small firms couldn't afford enterprise legal-tech tooling.",
    solution:
      "Varex AI reads a contract, flags clauses that deviate from a firm's playbook, and explains the deviation in plain language with a suggested redline — reviewed and approved by a human before anything ships.",
    role: "Founding Engineer",
    year: "2026",
    image: "/images/projects/varex-ai.png",
    techStack: ["Next.js", "TypeScript", "OpenRouter API", "Tailwind CSS"],
    liveUrl: "https://varex.ai",
    featured: true,
    metrics: [
      { label: "Review time saved", value: "83%" },
      { label: "Documents processed", value: "94,000+" },
      { label: "Firms onboarded", value: "60+" },
    ],
  },
  {
    slug: "ip-tracker",
    name: "IP Tracker",
    tagline: "Track your IP addresses with ease.",
    description:
      "A simple tool to track and manage your IP addresses across different networks.",
    problem:
      "Managing multiple IP addresses across various networks is cumbersome and error-prone.",
    solution:
      "IP Tracker centralizes every address into one lookup, tagging each entry by network so nothing gets lost or duplicated across environments.",
    role: "Design & Engineering",
    year: "2026",
    image: "/images/projects/iptracker.png",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
    repoUrl: "https://github.com/alexrivera/ip-tracker",
    featured: true,
    metrics: [
      { label: "Bundle size", value: "38kb" },
      { label: "GitHub stars", value: "1,200+" },
    ],
  },
  {
    slug: "eims",
    name: "EIMS",
    tagline: "Inventory software for teams that hate inventory software.",
    description:
      "An enterprise inventory management system rebuilt from the ground up for speed and clarity.",
    problem:
      "A logistics client's legacy inventory system took eleven clicks to log a single item and regularly lost data during shift changes.",
    solution:
      "EIMS reduced the core logging flow to two steps, added real-time multi-warehouse sync, and shipped an offline mode so floor staff never lose a scan again.",
    role: "Full-Stack Engineer",
    year: "2026 — Present",
    image: "/images/projects/eims.png",
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    featured: false,
    metrics: [
      { label: "Logging steps", value: "11 → 2" },
      { label: "Warehouses synced", value: "24" },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
