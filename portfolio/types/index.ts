export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  year: string;
  category: string;
  image: string;
  screenshots?: { src: string; title: string; description: string }[];
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
  overview?: string;
  features?: string[];
}

export interface Skill {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  summary: string;
  highlights: string[];
  stack?: string[];
}

export interface Service {
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

export interface NavLink {
  label: string;
  href: string;
}
