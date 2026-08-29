import { NavLink } from "@/types";

export const SITE = {
  name: "Alex Rivera",
  title: "Alex Rivera — Full-Stack Developer",
  role: "Full-Stack Developer",
  tagline: "I design and build software that feels inevitable.",
  description:
    "Portfolio of Alex Rivera, a full-stack developer focused on building fast, considered products across web and AI.",
  url: "https://alexrivera.dev",
  email: "hello@alexrivera.dev",
  calUrl: "https://cal.com/alexrivera",
  location: "Remote · Available worldwide",
  ogImage: "/images/og/og-image.png",
};

export const NAV_LINKS: NavLink[] = [
  { label: "Overview", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Contact", href: "/contact" },
];
