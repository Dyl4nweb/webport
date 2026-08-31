import type { NavLink } from "@/types";

export const SITE = {
  name: "Dylan Ramos",
  title: "Dylan Ramos — Full Stack Engineer",
  role: "Full Stack Engineer",
  tagline: "I design and build software that feels inevitable.",
  description:
    "Portfolio of Dylan Ramos, a full stack engineer focused on building fast, considered products across web and AI.",
  url: "https://dylanramos.vercel.app",
  email: "kurtdylanviray@gmail.com",
  calUrl: "https://cal.com/dylanweb444",
  location: "Manila, Philippines",
  ogImage: "/images/og/og.png",
};

export const NAV_LINKS: NavLink[] = [
  { label: "Overview", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Certifications", href: "/certifications" },
  { label: "Contact", href: "/contact" },
];