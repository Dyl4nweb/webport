import { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "motus",
    name: "Motus",
    tagline: "Movement tracking, reimagined.",
    description:
      "A fitness analytics platform that turns raw workout data into a coaching voice athletes actually trust.",
    role: "Lead Product Engineer",
    year: "2026 — Present",
    category: "Web App",
    image: "/images/projects/motus.png",
    screenshots: [
      {
        src: "/images/projects/motus-1.png",
        title: "Daily coaching feed",
        description:
          "One clear training recommendation surfaced each day instead of forty charts.",
      },
      {
        src: "/images/projects/motus-2.png",
        title: "Training load overview",
        description:
          "Real-time wearable data unified into a single model for smarter session planning.",
      },
      {
        src: "/images/projects/motus-3.png",
        title: "Performance trends",
        description:
          "Weekly and monthly views that highlight progress without overwhelming with numbers.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    liveUrl: "https://motus-tracker.vercel.app",
    featured: true,
  },
  {
    slug: "varex-ai",
    name: "Varex AI",
    tagline: "An assistant for people who read contracts for a living.",
    description:
      "An AI-assisted document review tool that helps legal teams find risk in minutes instead of days.",
    role: "Founding Engineer",
    year: "2026",
    category: "Web App",
    image: "/images/projects/varex-ai.png",
    screenshots: [
      {
        src: "/images/projects/varex-ai-1.png",
        title: "Risk flagging",
        description:
          "Clauses that deviate from a firm's playbook are highlighted with plain-language explanations.",
      },
      {
        src: "/images/projects/varex-ai-2.png",
        title: "Suggested redlines",
        description:
          "One-click redline suggestions reviewed and approved by a human before anything ships.",
      },
      {
        src: "/images/projects/varex-ai-3.png",
        title: "Review dashboard",
        description:
          "At-a-glance status for every document in the pipeline, from upload to signed off.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "OpenRouter API", "Tailwind CSS"],
    liveUrl: "https://varexai.vercel.app",
    featured: true,
  },
  {
    slug: "brew-bloom",
    name: "Brew & Bloom Coffee Co.",
    tagline: "Craft Coffee, Cozy Vibes.",
    description:
      "A warm, responsive coffee shop landing page designed to showcase specialty drinks, fresh pastries, location details, and a QR-powered digital menu.",
    role: "Frontend Developer",
    year: "2026",
    category: "Landing Page",
    image: "/images/projects/brew-bloom.png",
    screenshots: [
      {
        src: "/images/projects/brew-bloom-1.png",
        title: "Warm hero experience",
        description:
          "A welcoming hero section with a clear menu call-to-action, cozy coffee-shop imagery, and a hand-roasted daily highlight.",
      },
      {
        src: "/images/projects/brew-bloom-2.png",
        title: "QR-powered menu",
        description:
          "A server-rendered QR code lets customers scan and open the full coffee menu directly from their phone.",
      },
      {
        src: "/images/projects/brew-bloom-3.png",
        title: "Location and contact",
        description:
          "A mobile-friendly location, hours, contact details, and map section makes visiting the shop simple.",
      },
    ],
    techStack: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://drcoffeeshop.vercel.app",
    featured: true,
  },
  {
    slug: "ip-tracker",
    name: "Ip Tracker",
    tagline: "Track your IP addresses with ease.",
    description:
      "A simple tool to track and manage your IP addresses across different networks.",
    role: "Design & Engineering",
    year: "2026",
    category: "Web App",
    image: "/images/projects/iptracker.png",
    screenshots: [
      {
        src: "/images/projects/iptracker-1.png",
        title: "Single-screen lookup",
        description:
          "One input, one number. No unnecessary UI competing for attention.",
      },
      {
        src: "/images/projects/iptracker-2.png",
        title: "Network history",
        description:
          "Past lookups stored locally so repeat checks are instant.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "IPinfo API"],
    liveUrl: "https://iptrackaddress.vercel.app",
    featured: true,
  },
  {
    slug: "eims",
    name: "EIMS",
    tagline: "Inventory software for teams that hate inventory software.",
    description:
      "An enterprise inventory management system rebuilt from the ground up for speed and clarity.",
    role: "Full-Stack Engineer",
    year: "2026 — Present",
    category: "Web App",
    image: "/images/projects/eims.png",
    screenshots: [
      {
        src: "/images/projects/eims-1.png",
        title: "Two-step logging",
        description:
          "Core flow reduced from eleven clicks to two steps for faster shift handoffs.",
      },
      {
        src: "/images/projects/eims-2.png",
        title: "Multi-warehouse sync",
        description:
          "Real-time inventory across 24 warehouses with zero data loss during peak hours.",
      },
      {
        src: "/images/projects/eims-3.png",
        title: "Offline mode",
        description:
          "Floor staff keep scanning even without a connection — data syncs when back online.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    featured: false,
  },

  {
    slug: "Poster-of-motus-v2",
    name: "Poster of Motus V2.0",
    tagline: "Motus v0.2",
    description:
      "A social-media-ready pubmat announcing Motus v0.2: focus sessions, breaks, and daily stats — all in one app. Built around bold typography and an energetic color system to drive downloads.",
    role: "Graphic Designer",
    year: "2026",
    category: "Graphic Design",
    image: "/images/pubmats/motus1.jpg",
    screenshots: [
      {
        src: "/images/pubmats/motus1.jpg",
        title: "Motus Poster V2.0",
        description: "The hero layout used across Facebook and IG stories.",
      },
      {
        src: "/images/pubmats/motus2.png",
        title: "Motus Cover",
        description: "Video cover for the YouTube promotion of Motus",
      },
    ],
    techStack: ["Canva"],
    featured: true,
  },
  {
    slug: "varex-ai-cover",
    name: "Varex AI Cover",
    tagline: "Futuristic branding for an AI assistant.",
    description:
      "A single promotional cover for Varex AI — futuristic interface designed for productivity and development, inspired by next-generation personal assistants.",
    role: "Graphic Designer",
    year: "2026",
    category: "Graphic Design",
    image: "/images/pubmats/varexaicover.png",
    screenshots: [
      {
        src: "/images/pubmats/varexaicover.png",
        title: "Varex AI Cover",
        description: "The hero visual used for the Varex AI promotion.",
      },
    ],
    techStack: ["Canva"],
    featured: false,
  },
  {
    slug: "linkedin-cover-photo",
    name: "LinkedIn Cover Photo",
    tagline: "A professional profile banner.",
    description:
      "A wide-format LinkedIn cover photo — clean, modern branding that represents me as a developer and designer.",
    role: "Graphic Designer",
    year: "2026",
    category: "Graphic Design",
    image: "/images/pubmats/linkedin-cover.png",
    screenshots: [
      {
        src: "/images/pubmats/linkedin-cover.png",
        title: "LinkedIn Profile Banner",
        description: "The wide-format hero visual used for the LinkedIn profile.",
      },
    ],
    techStack: ["Canva"],
    featured: false,
  },
  {
    slug: "portfolio-platform",
    name: "Portfolio Platform",
    tagline: "Ideas I've turned into products.",
    description:
      "Built my portfolio as a full-stack platform, with the public website backed by a private Admin Dashboard for managing client inquiries, projects, bookings, visitors, analytics, activity, and Gmail integration.",
    role: "Full-Stack Engineer",
    year: "2026",
    category: "Web App",
    image: "/images/projects/portfolio.png",
    screenshots: [
      {
        src: "/images/projects/portfolio.png",
        title: "Public Portfolio",
        description: "The public-facing website showcasing projects and contact.",
      },
      {
        src: "/images/projects/portfolio-2.png",
        title: "Admin Dashboard",
        description: "Private dashboard for managing inquiries, bookings, and analytics.",
      },
      {
        src: "/images/projects/portfolio-3.png",
        title: "Gmail Integration",
        description: "Unified inbox for viewing client communications directly.",
      },
    ],
    techStack: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Tailwind CSS",
      "Cal.com API",
      "Gmail API",
    ],
    featured: false,
  },
  {
    slug: "motus-mobile",
    name: "Motus — Mobile App",
    tagline: "Discipline in motion — habit tracking, streak mechanics, and focus sessions.",
    description:
      "A luxury dark-themed habit tracking mobile app built offline-first with React Native and Expo, featuring one-tap check-ins, freeze credits, Pomodoro focus sessions, milestone badges, and 70-day consistency heatmaps powered by AsyncStorage.",
    role: "Software Engineer",
    year: "2025 — Present",
    category: "Mobile App",
    image: "/images/projects/motus-mobile.png",
    screenshots: [
      {
        src: "/images/projects/motus-mobile-1.png",
        title: "Today Protocol & Check-in",
        description:
          "Morning Protocol greeting, daily habit progress, and one-tap habit logging with freeze credits.",
      },
      {
        src: "/images/projects/motus-mobile-2.png",
        title: "Habit Directory & 7-Day Grid",
        description:
          "Active, All, and Archived habit directory with a 7-day consistency grid and freeze protections.",
      },
      {
        src: "/images/projects/motus-mobile-3.png",
        title: "10-Week Heatmap & Analytics",
        description:
          "70-day visual activity heatmap, focus session breakdown, and habit consistency metrics.",
      },
    ],
    techStack: ["React Native", "Expo", "TypeScript", "AsyncStorage"],
    featured: false,
  },
  {
    slug: "pantry-to-plate",
    name: "Filipino Pantry to Plate",
    tagline: "Walang tapon, walang sayang. Sagot ka ng Kusina.",
    description:
      "Tuklasin ang mga masasarap at abot-kayang pagkaing Pinoy gamit lamang ang mga sangkap na nasa kusina mo na ngayon—kahit walang internet o mobile load.",
    role: "Lead - Front End Developer",
    year: "2026",
    category: "Landing Page",
    image: "/images/projects/pantry.png",
    screenshots: [
      {
        src: "/images/projects/pantry-1.png",
        title: "Pantry to Plate",
        description: "Mobile-friendly recipe discovery interface.",
      },
    ],
    techStack: ["Next.js", "Tailwind CSS", "TypeScript"],
    liveUrl: "https://filipino-pantrymate.vercel.app/",
    featured: false,
  },
];

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectsByCategory(category: string): Project[] {
  return projects.filter((p) => p.category === category);
}