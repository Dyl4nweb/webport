# Portfolio — Apple-inspired

A clean, minimal personal portfolio built with Next.js 14 (App Router), TypeScript, and Tailwind CSS, styled after Apple's product marketing sites: generous whitespace, restrained color, large confident type, and subtle motion.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (custom "apple" design tokens in `tailwind.config.ts`)
- Inter (system-font fallback stack mimics SF Pro)

## Getting started
```bash
npm install
npm run dev
```
Visit http://localhost:3000

## Structure
- `app/` — routes: home, about, projects (+ dynamic `[slug]`), experience, contact
- `components/layout` — Navbar, Footer, MobileMenu
- `components/sections` — homepage sections (Hero, About, Skills, Experience, FeaturedProjects, Services, Testimonials, Contact)
- `components/projects` — project card/grid/detail components
- `components/ui` — Button, Badge, Container, SectionHeading, ThemeToggle
- `data/` — all editable content (projects, skills, experience, services, social links)
- `lib/` — `constants.ts` (site metadata + nav) and `utils.ts`
- `types/` — shared TypeScript interfaces

## Customizing
1. Edit `lib/constants.ts` with your name, role, tagline, and email.
2. Edit the files in `data/` with your real projects, experience, and skills.
3. Replace the placeholder images in `public/images/` (profile, project covers, OG image) and add your real `public/resume/resume.pdf`.
4. Colors and type scale live in `tailwind.config.ts` under `theme.extend` — tweak `accent`, `ink`, and `surface` to restyle the whole site.

## Dark mode
Toggled via the sun/moon icon in the navbar, persisted to `localStorage`, and respects the visitor's OS preference on first visit.

## Deploying
Ready for Vercel: push to a Git repo and import it at vercel.com/new, or run `vercel` from this directory.
