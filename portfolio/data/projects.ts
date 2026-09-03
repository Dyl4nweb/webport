import { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "motus-mobile",
    name: "Motus — Mobile App",
    tagline: "Discipline in motion — habit tracking, streak mechanics, and focus sessions.",
    description:
      "A luxury dark-themed habit tracking mobile app built offline-first with React Native and Expo, featuring one-tap check-ins, freeze credits, Pomodoro focus sessions, milestone badges, and 70-day consistency heatmaps powered by AsyncStorage. Soon releasing on the Google Play Store, with iOS App Store rollout targeted by next month — stay updated!",
    role: "Lead Mobile Developer",
    year: "2026 — Present",
    category: "Mobile App",
    image: "/images/projects/motus-mobile.png",
    screenshots: [
      {
        src: "/images/projects/motus-mobile-1.png",
        title: "Today Protocol & Check-in",
        description:
          "Morning Protocol greeting, daily habit progress bar, and one-tap habit logging with freeze credits.",
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
    featured: true,
  },
  {
    slug: "motus",
    name: "Motus — Habit Tracker",
    tagline: "Master your daily routines with distraction-free habit tracking.",
    description:
      "A minimal, distraction-free habit tracker web application engineered for speed and daily progress. Features real-time check-ins, Pomodoro focus sessions, habit consistency management, awards, and PostgreSQL Row Level Security.",
    role: "Lead Full-Stack Engineer",
    year: "2026 — Present",
    category: "Web App",
    image: "/images/projects/motus.png",
    screenshots: [
      {
        src: "/images/projects/motus-1.png",
        title: "Daily Habit Progress",
        description:
          "Clean daily progress tracker with one-tap completion, freeze credits, and habit streak counters.",
      },
      {
        src: "/images/projects/motus-2.png",
        title: "Pomodoro Focus Timer",
        description:
          "Integrated interval timer for Focus sessions (25:00), Short Breaks, and Long Breaks.",
      },
      {
        src: "/images/projects/motus-3.png",
        title: "Habit Management",
        description:
          "Organized habit directory to create, manage, and track individual active habits.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "PostgreSQL"],
    liveUrl: "https://motus-tracker.vercel.app",
    featured: true,
  },
  {
    slug: "varex-ai",
    name: "Varex AI",
    tagline: "Virtual Autonomous Reasoning & Execution System.",
    description:
      "A futuristic AI assistant web application with a cybernetic command interface. Features voice speech recognition, real-time AI reasoning, speech synthesis, and dark sci-fi HUD styling.",
    role: "Founding Engineer",
    year: "2026",
    category: "Web App",
    image: "/images/projects/varex-ai.png",
    screenshots: [
      {
        src: "/images/projects/varex-ai.png",
        title: "System Initialization",
        description:
          "Cybernetic boot sequence calibrating neural pathways, voice matrix, and secure connection.",
      },
      {
        src: "/images/projects/varex-ai-1.png",
        title: "Voice & Command Console",
        description:
          "Interactive AI terminal with microphone speech input, conversational reasoning, and command execution.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "OpenRouter API", "Tailwind CSS", "Web Speech API"],
    liveUrl: "https://varexai.vercel.app",
    featured: true,
  },
  {
    slug: "brew-bloom",
    name: "Brew & Bloom Coffee Co.",
    tagline: "Craft Coffee, Cozy Vibes.",
    description:
      "A warm, responsive coffee shop landing page designed to showcase specialty single-origin coffee, fresh in-house pastries, café story, and location details with QR digital menu integration.",
    role: "Frontend Developer",
    year: "2026",
    category: "Landing Page",
    image: "/images/projects/brew-bloom-1.png",
    screenshots: [
      {
        src: "/images/projects/brew-bloom-1.png",
        title: "Warm Hero Experience",
        description:
          "Welcoming hero section with menu call-to-actions, hand-roasted daily highlights, and cozy cafe vibes.",
      },
      {
        src: "/images/projects/brew-bloom-2.png",
        title: "Our Story & Roasting",
        description:
          "Story section showcasing small-batch roasting, farm-fresh ingredients, and artisan baking.",
      },
      {
        src: "/images/projects/brew-bloom-3.png",
        title: "Get in Touch & Location",
        description:
          "Responsive contact cards with direct email, phone call links, and physical store hours.",
      },
    ],
    techStack: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    liveUrl: "https://drcoffeeshop.vercel.app",
    featured: true,
  },
  {
    slug: "ip-tracker",
    name: "IP Tracker",
    tagline: "Real-time IP geolocation and network intelligence tool.",
    description:
      "A sleek cybersecurity-themed IP geolocation web app. Look up any IP address to inspect ISP provider, city, region, coordinates, timezone, and interactive Leaflet map rendering.",
    role: "Design & Engineering",
    year: "2026",
    category: "Web App",
    image: "/images/projects/iptracker.png",
    screenshots: [
      {
        src: "/images/projects/iptracker.png",
        title: "Access Portal & Home Page",
        description:
          "High-security password-gated home page entry screen with cybernetic neon glow.",
      },
      {
        src: "/images/projects/iptracker-1.png",
        title: "IP Geolocation Dashboard",
        description:
          "Live query dashboard displaying ISP details, coordinate breakdown, and interactive Leaflet map.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Leaflet", "IPinfo API"],
    liveUrl: "https://iptrackaddress.vercel.app",
    featured: true,
  },
  {
    slug: "pantry-to-plate",
    name: "Filipino Pantry to Plate",
    tagline: "Walang tapon, walang sayang. Sagot ka ng Kusina.",
    description:
      "Isang zero-waste Pinoy recipe discovery web app at offline-ready PWA na 100% libre at walang database. Pumili o mag-type ng mga tirang sangkap sa ref o kusina (bahaw, sardinas, itlog, gulay) para agad makahanap ng mga masasarap na lutuing Pinoy kahit walang internet o mobile load.",
    role: "Lead Front-End Developer",
    year: "2026",
    category: "Web App",
    image: "/images/projects/pantry.png",
    screenshots: [
      {
        src: "/images/projects/pantry.png",
        title: "Zero-Waste Home Page",
        description:
          "Offline-ready landing and hero banner promoting zero food waste with instant recipe matching.",
      },
      {
        src: "/images/projects/pantry-1.png",
        title: "Pinoy Recipe Matcher",
        description:
          "Interactive ingredient selector by protein, gulay, and carbs/tira to match Filipino recipes.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PWA / Offline Storage"],
    liveUrl: "https://filipino-pantrymate.vercel.app/",
    featured: false,
  },
  {
    slug: "eims",
    name: "EMPLINFOMASYS (EIMS)",
    tagline: "Enterprise workforce, attendance, and payroll management system.",
    description:
      "A comprehensive Employee Information Management System (EMPLINFOMASYS) designed for enterprise administrative operations. Features centralized employee directory records, attendance tracking, automated payroll calculations with payslip generation, and employee leave request processing.",
    role: "Full-Stack Engineer",
    year: "2026",
    category: "Web App",
    image: "/images/projects/eims.png",
    screenshots: [
      {
        src: "/images/projects/eims.png",
        title: "Secure Access Portal",
        description:
          "Enterprise authentication portal for secure workforce and administrative access.",
      },
      {
        src: "/images/projects/eims-1.png",
        title: "Admin Dashboard",
        description:
          "Executive overview showing total employees, active/inactive count, pending leaves, and recent staff.",
      },
      {
        src: "/images/projects/eims-2.png",
        title: "Payroll Management",
        description:
          "Compensation tracking with total disbursed salary, pending amounts, and pay slip generation.",
      },
      {
        src: "/images/projects/eims-3.png",
        title: "Leave Requests",
        description:
          "Interactive leave application approval workflow for sick and vacation leaves.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "PostgreSQL"],
    featured: false,
  },
  {
    slug: "portfolio-platform",
    name: "Portfolio Platform & Admin Suite",
    tagline: "Full-stack personal portfolio backed by a private real-time admin suite.",
    description:
      "A full-stack portfolio platform built with Next.js App Router and Supabase. Includes a private authenticated Admin Dashboard for monitoring real-time visitor analytics, client inquiries, meeting bookings, and Gmail inbox integration.",
    role: "Full-Stack Engineer",
    year: "2026",
    category: "Web App",
    image: "/images/projects/portfolio.png",
    screenshots: [
      {
        src: "/images/projects/portfolio.png",
        title: "Public Portfolio",
        description: "Modern dark-mode public website showcasing selected work, tech stack, and contact integrations.",
      },
      {
        src: "/images/projects/portfolio-2.png",
        title: "Admin Dashboard",
        description: "Real-time command center for visitor tracking, page views, inquiry conversion, and system stats.",
      },
      {
        src: "/images/projects/portfolio-3.png",
        title: "Analytics & Insights",
        description: "Privacy-friendly analytics tracking 14-day page view trends, device distribution, and top referrers.",
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
    liveUrl: "https://www.dylanramos.site",
    featured: false,
  },
  {
    slug: "Poster-of-motus-v2",
    name: "Poster of Motus V2.0",
    tagline: "Promotional pubmat for Motus v0.2 Pomodoro release.",
    description:
      "A social-media marketing poster and YouTube cover design announcing the Motus v0.2 Pomodoro update. Built around bold typography, vibrant energetic color palette, and QR code download callouts.",
    role: "Graphic Designer",
    year: "2026",
    category: "Graphic Design",
    image: "/images/pubmats/motus1.jpg",
    screenshots: [
      {
        src: "/images/pubmats/motus1.jpg",
        title: "Motus Poster V2.0",
        description: "Mobile-framed pubmat design announcing Pomodoro feature release with QR code link.",
      },
      {
        src: "/images/pubmats/motus2.png",
        title: "Motus Cover & Feature Showcase",
        description: "Full-stack habit tracker showcase graphic highlighting Next.js, Supabase, and Tailwind tech stack.",
      },
    ],
    techStack: ["Canva", "Photoshop"],
    featured: true,
  },
  {
    slug: "varex-ai-cover",
    name: "Varex AI Promo & Branding",
    tagline: "Futuristic cybernetic branding for an AI assistant.",
    description:
      "Promotional banner and visual assets designed for Varex AI, showcasing the cybernetic aesthetic, voice interface console, and GCash prompt unlock integration.",
    role: "Graphic Designer",
    year: "2026",
    category: "Graphic Design",
    image: "/images/pubmats/varexaicover.png",
    screenshots: [
      {
        src: "/images/pubmats/varexaicover.png",
        title: "Varex AI Promo Banner",
        description: "Full-stack Next.js AI assistant branding showcasing conversational UI and GCash payment flow.",
      },
    ],
    techStack: ["Canva", "Figma"],
    featured: false,
  },
  {
    slug: "linkedin-cover-photo",
    name: "LinkedIn Cover Photo",
    tagline: "Minimalist developer & engineer profile banner.",
    description:
      "A sleek, dark desk aesthetic banner for LinkedIn featuring professional contact details, title badge, and scannable portfolio QR code.",
    role: "Graphic Designer",
    year: "2026",
    category: "Graphic Design",
    image: "/images/pubmats/linkedin-cover.png",
    screenshots: [
      {
        src: "/images/pubmats/linkedin-cover.png",
        title: "LinkedIn Profile Banner",
        description: "High-resolution header visual with contact information and portfolio QR badge.",
      },
    ],
    techStack: ["Canva"],
    featured: false,
  },
];

export function getFeaturedProjects(): Project[] {
  const featured = projects.filter((p) => p.featured || p.slug === "motus-mobile");
  return featured.sort((a, b) => {
    const aIsMobile = a.slug === "motus-mobile" || a.category === "Mobile App";
    const bIsMobile = b.slug === "motus-mobile" || b.category === "Mobile App";
    if (aIsMobile && !bIsMobile) return -1;
    if (!aIsMobile && bIsMobile) return 1;
    return 0;
  });
}

export function getProjectsByCategory(category: string): Project[] {
  return projects.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}