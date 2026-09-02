import { type SiteTheme } from "@/lib/theme";

export interface ThemeCopy {
  heroEyebrow?: string;
  heroTaglinePrefix?: string;
  typewriterRoles: string[];
  resumeBtnText: string;
  contactBtnText: string;
  featuredProjectsTitle: string;
  featuredProjectsEyebrow: string;
  experienceEyebrow: string;
  experienceTitle: string;
  techStackEyebrow: string;
  techStackTitle: string;
  contactEyebrow: string;
  contactTitle: string;
  contactSubtitle: string;
  dockHomeLabel: string;
  dockAboutLabel: string;
  dockProjectsLabel: string;
  dockContactLabel: string;
}

export const THEME_COPIES: Record<SiteTheme, ThemeCopy> = {
  modern: {
    heroEyebrow: undefined,
    heroTaglinePrefix: "",
    typewriterRoles: [
      "Software Engineer",
      "Tech Enthusiast",
      "Full Stack Developer",
      "Info Tech Support",
      "Graphic Designer",
    ],
    resumeBtnText: "View Resume",
    contactBtnText: "Get in touch",
    featuredProjectsEyebrow: "Featured Projects",
    featuredProjectsTitle: "Selected Works",
    experienceEyebrow: "Career & Milestones",
    experienceTitle: "Experience",
    techStackEyebrow: "Technologies",
    techStackTitle: "Tech Stack",
    contactEyebrow: "Let's Connect",
    contactTitle: "Get in Touch",
    contactSubtitle: "Have a project in mind, an opportunity, or just want to chat? Send a message.",
    dockHomeLabel: "Home",
    dockAboutLabel: "About",
    dockProjectsLabel: "Projects",
    dockContactLabel: "Contact",
  },
  cafe: {
    heroEyebrow: undefined,
    heroTaglinePrefix: "",
    typewriterRoles: [
      "Software Engineer",
      "Full Stack Developer",
      "Creative Web Engineering",
      "System Architecture & APIs",
      "Graphic & Interface Designer",
    ],
    resumeBtnText: "View Resume",
    contactBtnText: "Get in touch",
    featuredProjectsEyebrow: "Selected Works",
    featuredProjectsTitle: "Featured Projects",
    experienceEyebrow: "Career Journey",
    experienceTitle: "Experience",
    techStackEyebrow: "Technologies",
    techStackTitle: "Tech Stack",
    contactEyebrow: "Let's Connect",
    contactTitle: "Get in Touch",
    contactSubtitle: "Have a project in mind, an opportunity, or just want to collaborate? Send a message.",
    dockHomeLabel: "Home",
    dockAboutLabel: "About",
    dockProjectsLabel: "Projects",
    dockContactLabel: "Contact",
  },
  cyber: {
    heroEyebrow: "[ ROOT@DYLAN-OS // ACCESS_GRANTED // v4.2 ]",
    heroTaglinePrefix: ">_ EXECUTING: ",
    typewriterRoles: [
      "root@system:~$ ./fullstack.sh",
      "SYS_ARCHITECT & ENGINEER",
      "DEPLOYING_SECURE_APIS...",
      "TACTICAL_FRONTEND_HUD",
      "BUFFER_OVERFLOW: 0% ERRORS",
    ],
    resumeBtnText: ">_ EXECUTE RESUME",
    contactBtnText: ">_ INITIALIZE COMMS",
    featuredProjectsEyebrow: "[ 01_PROJECT_ARCHIVES.BIN ]",
    featuredProjectsTitle: "Compiled Systems",
    experienceEyebrow: "[ SYSTEM_LOGS & AUDIT_TRAIL ]",
    experienceTitle: "Runtime Milestones",
    techStackEyebrow: "[ SYSTEM_DEPENDENCIES ]",
    techStackTitle: "Core Kernel & Stack",
    contactEyebrow: "[ PROTOCOL: TRANSMISSION_CHANNEL ]",
    contactTitle: "Establish Connection",
    contactSubtitle: "Transmit a encrypted payload or initialize a direct channel communication with the operator.",
    dockHomeLabel: "Terminal",
    dockAboutLabel: "Dossier",
    dockProjectsLabel: "Archives",
    dockContactLabel: "Comms",
  },
};
