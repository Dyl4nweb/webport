import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarGate from "@/components/layout/NavbarGate";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";
import AIChatLazy from "@/components/ui/AIChatLazy";
import PublicChromeGate from "@/components/admin/PublicChromeGate";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import { SITE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  icons: {
    icon: "/icons/icon.png",
    apple: "/images/og/icon.png",
  },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [{ url: SITE.ogImage, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(/^\\/admin(\\/|$)/.test(location.pathname))document.documentElement.setAttribute("data-admin","")`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){function done(){var s=document.getElementById("splash");if(s){s.classList.add("is-done");setTimeout(function(){s.style.display="none"},700)}var m=document.getElementById("app-main");if(m)m.classList.add("is-ready")}function start(){requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(done,800)})})}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",start)}else{start()}}();`,
          }}
        />
      </head>
      <body className="font-text">
        <PublicChromeGate />
        <PageViewTracker />
        <div id="splash" suppressHydrationWarning>
          <div id="splash-line" />
          <div id="splash-text">Loading</div>
        </div>
        <NavbarGate />
        <main id="app-main" suppressHydrationWarning>{children}</main>
        <SmoothScroll />
        <Footer />
        <AIChatLazy />
      </body>
    </html>
  );
}
