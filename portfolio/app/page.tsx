import Hero from "@/components/sections/Hero";
import StatsBanner from "@/components/sections/StatsBanner";
import Services from "@/components/sections/Services";
import Skills from "@/components/sections/Skills";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import Contact from "@/components/sections/Contact";
import { SITE } from "@/lib/constants";
import { socialLinks } from "@/data/social";

const personJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${SITE.url}/#profilepage`,
      url: SITE.url,
      name: SITE.title,
      mainEntity: { "@id": `${SITE.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: "Kurt Dylan Ramos Viray",
      alternateName: "Dylan Ramos",
      url: SITE.url,
      image: `${SITE.url}/images/profile/profile.png`,
      email: `mailto:${SITE.email}`,
      jobTitle: SITE.role,
      description: `${SITE.role} based in ${SITE.location}.`,
      sameAs: socialLinks
        .filter((s) => s.url.startsWith("https://"))
        .map((s) => s.url),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Hero />
      <StatsBanner />
      <Services />
      <Skills />
      <FeaturedProjects />
      <Contact />
    </>
  );
}
