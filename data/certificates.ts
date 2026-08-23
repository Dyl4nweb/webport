export interface Certificate {
  title: string;
  issuer: string;
  category: string;
  year: string;
  logo: string;
  image: string;
  description: string;
  verifyUrl?: string;
}

export const certificates: Certificate[] = [
  {
    title: "Cyber Threat Management",
    issuer: "Cisco Networking Academy",
    category: "Cybersecurity",
    year: "2026",
    logo: "/certificates/logos/CC.png",
    image: "/certificates/CTM.png",
    description:
      "The Cisco Cyber Threat Management course focuses on identifying, analyzing, and managing cybersecurity threats and risks. It introduces key concepts in threat intelligence, vulnerabilities, attack techniques, risk assessment, and security controls.",
    verifyUrl:
      "https://www.credly.com/badges/ac6957ab-dbb2-49b5-9d65-3ed0d833cf0a/public_url",
  },

  {
    title: "Introduction to Cybersecurity",
    issuer: "Cisco Networking Academy",
    category: "Cybersecurity",
    year: "2026",
    logo: "/certificates/logos/CC.png",
    image: "/certificates/C.png",
    description:
      "The Cisco Introduction to Cybersecurity course explores the global impact of cybercrime and the critical need for digital defense. It introduces the fundamental principles of data confidentiality, integrity, and availability.",
    verifyUrl:
      "https://www.credly.com/badges/f8ae7c71-826c-43b7-a1f6-5ecc568c6bc1",
  },

  {
    title: "Generative AI Fundamentals",
    issuer: "DataBricks",
    category: "Artificial Intelligence",
    year: "2026",
    logo: "/certificates/logos/DB.png",
    image: "/certificates/DB.png",
    description:
      "A foundational course focused on generative AI concepts, applications, and modern AI-powered solutions.",
    verifyUrl:
      "https://api.accredible.com/v1/auth/invite?code=843f9d3e34f04e5cd026&credential_id=df9791ed-d4d3-447d-b8c0-78788cf9a2d5",
  },

  {
    title: "AI Agents Fundamentals",
    issuer: "DataBricks",
    category: "Artificial Intelligence",
    year: "2026",
    logo: "/certificates/logos/DB.png",
    image: "/certificates/AF.png",
    description:
      "An introduction to AI agents, agentic workflows, multi-agent systems, and enterprise applications for AI-powered solutions.",
    verifyUrl:
      "https://api.accredible.com/v1/auth/invite?code=843f9d3e34f04e5cd026&credential_id=9bd5932b-a64b-4e45-a5d0-e156529e1324",
  },

  {
    title: "Cybersecurity Fundamentals",
    issuer: "IBM SkillsBuild",
    category: "Cybersecurity",
    year: "2026",
    logo: "/certificates/logos/IBM.png",
    image: "/certificates/CF.png",
    description:
      "This course introduces cybersecurity fundamentals, including cyberattacks, social engineering, real-world threats, security practices, and cybersecurity career paths.",
    verifyUrl:
      "https://www.credly.com/badges/83c7f2bd-4bcf-4870-95df-33e5e0567890/public_url",
  },

  {
    title: "Career in Cybersecurity",
    issuer: "Cybrary",
    category: "Cybersecurity",
    year: "2026",
    logo: "/certificates/logos/CB.jpg",
    image: "/certificates/CC.png",
    description:
      "An introductory cybersecurity course designed to help beginners build foundational technology knowledge before specializing.",
    verifyUrl:
      "https://app.cybrary.it/profile/DylanWebb0113?tab=cert-completion&cert=CC-21a5e0ee-4567-4998-b405-ca9244ebd00b",
  },

  {
    title: "Critical Thinking in the AI Era",
    issuer: "HP Life | HP Foundation",
    category: "Artificial Intelligence",
    year: "2026",
    logo: "/certificates/logos/HP.png",
    image: "/certificates/HP.png",
    description:
      "A course focused on evaluating online information, recognizing misinformation and bias, and applying critical-thinking frameworks in the AI era.",
    verifyUrl:
      "https://www.life-global.org/certificate/95af6fdc-dc3e-483f-97f0-925b051d587e",
  },

  {
    title: "Data Visualization V8",
    issuer: "freeCodeCamp",
    category: "Web Development",
    year: "2023",
    logo: "/certificates/logos/FC.jpg",
    image: "/certificates/DV.png",
    description:
      "Built charts, graphs, and maps to present different types of data using the D3.js library.",
    verifyUrl:
      "https://www.freecodecamp.org/certification/kdviray/data-visualization",
  },

  {
    title: "Legacy JavaScript Algorithms & Data Structures V7",
    issuer: "freeCodeCamp",
    category: "Web Development",
    year: "2023",
    logo: "/certificates/logos/FC.jpg",
    image: "/certificates/JSA.png",
    description:
      "Covered JavaScript fundamentals including variables, arrays, objects, loops, functions, algorithms, and data structures.",
    verifyUrl:
      "https://www.freecodecamp.org/certification/kdviray/javascript-algorithms-and-data-structures",
  },

  {
    title: "Legacy Responsive Web Design V8",
    issuer: "freeCodeCamp",
    category: "Web Development",
    year: "2023",
    logo: "/certificates/logos/FC.jpg",
    image: "/certificates/RW.png",
    description:
      "Covered HTML and CSS fundamentals, modern layouts, accessibility, design principles, and responsive web development.",
    verifyUrl:
      "https://freecodecamp.org/certification/kdviray/responsive-web-design",
  },

  {
    title: "Front End Development Libraries V8",
    issuer: "freeCodeCamp",
    category: "Web Development",
    year: "2023",
    logo: "/certificates/logos/FC.jpg",
    image: "/certificates/FED.png",
    description:
      "Covered front-end development libraries, Bootstrap, Sass, and practical techniques for building modern interfaces.",
    verifyUrl:
      "https://www.freecodecamp.org/certification/kdviray/front-end-development-libraries",
  },

  {
    title: "Pinning and Internship Training",
    issuer: "PSU",
    category: "Training & Internship",
    year: "2026",
    logo: "/certificates/logos/PSU.png",
    image: "/certificates/intern.png",
    description:
      "Completed the university's pinning ceremony and internship orientation, marking the beginning of professional industry training.",
  },

  {
    title: "On-The-Job Training",
    issuer: "HRMO / LGU",
    category: "Training & Internship",
    year: "2026",
    logo: "/certificates/logos/LGU.png",
    image: "/certificates/HRMO.png",
    description:
      "Completed On-the-Job Training focused on software development, technical support, and government information systems.",
  },
];