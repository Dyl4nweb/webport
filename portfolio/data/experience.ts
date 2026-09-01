import { ExperienceItem } from "@/types";

export const experience: ExperienceItem[] = [
  {
    company: "Motus",
    role: "Creator & Full-Stack Developer",
    start: "2026",
    end: "Present",
    location: "Remote",
    summary:
      "Designed and built Motus end-to-end — a fitness analytics platform that turns raw workout data into one clear daily recommendation instead of a wall of charts.",
    highlights: [
      "Built the full stack solo: data model, sync logic, and the entire frontend.",
      "Designed the interface to disappear — one recommendation a day, not forty metrics.",
      "Deployed and maintain the product in production on Vercel.",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Vercel"],
  },
  {
    company: "Local Government Unit — OJT Rotation",
    role: "Information Technology Intern (IT Support)",
    start: "Feb 2026",
    end: "May 2026",
    location: "Philippines",
    summary:
      "Completed a rotational internship across three offices — the Human Resource Management Office (HRMO), Rural Health Unit (RHU), and Public Assistance and Complaints Desk (PACD) — providing IT and administrative support at each.",
    highlights: [
      "HRMO: Assisted with office system operations, employee record management, document processing, and Daily Time Record (DTR) tracking.",
      "RHU: Organized and encoded health-related records, supporting daily administrative workflows and data accuracy.",
      "PACD: Handled client inquiries and complaints, coordinated across departments, and maintained records of public transactions.",
    ],
    stack: ["Microsoft Office", "Data Entry", "Document Management", "Records Management", "Customer Service"],
  },
  {
    company: "Pangasinan State University — Lingayen",
    role: "Bachelor of Science in Information Technology",
    start: "2022",
    end: "2026",
    location: "Lingayen, Pangasinan",
    summary:
      "Graduated with a degree in Information Technology, building a strong foundation in mobile and web development, systems administration, and IT support. Applied academic knowledge through hands-on projects and internship experience.",
    highlights: [
      "Built a foundation across web development, systems analysis, and networking.",
      "Applied coursework through hands-on projects and a full internship track.",
    ],
    stack: ["Web Development", "Systems Analysis", "Database Management", "Networking", "Problem Solving"],
  },
  {
    company: "PHINMA University of Pangasinan",
    role: "First Line of Code — Hello World in C++",
    start: "2021",
    end: "2022",
    location: "Pangasinan, Philippines",
    summary:
      "Wrote my very first program, a simple 'Hello World' in C++. This marked the beginning of my journey into programming and sparked my interest in software development.",
    highlights: [
      "Wrote and ran my first program, sparking an interest in software development.",
    ],
    stack: ["C++", "Fundamentals of Programming", "Problem Solving"],
  },
];
