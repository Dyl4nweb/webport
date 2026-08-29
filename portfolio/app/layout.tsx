import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarGate from "@/components/layout/NavbarGate";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";
import AIChatLazy from "@/components/ui/AIChatLazy";
import BackToTop from "@/components/ui/BackToTop";
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
  ],
  colorScheme: "dark light" as const,
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
    apple: "/icons/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE.name,
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { color-scheme: light dark; }
              @media (prefers-color-scheme: dark) {
                html:not(.light) { background-color: #000000 !important; color: #f5f5f7 !important; }
                html:not(.light) #splash { background-color: #000000 !important; --splash-bg: #000000 !important; }
              }
              html.dark { background-color: #000000 !important; color: #f5f5f7 !important; }
              html.dark #splash { background-color: #000000 !important; --splash-bg: #000000 !important; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if(/^\\/admin(\\/|$)/.test(location.pathname))document.documentElement.setAttribute("data-admin","")`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches);var r=document.documentElement;r.classList.remove("theme-swap");if(d){r.classList.add("dark");r.classList.remove("light");r.style.backgroundColor="#000000";r.style.colorScheme="dark";}else{r.classList.remove("dark");r.classList.add("light");r.style.backgroundColor="#fbfbfd";r.style.colorScheme="light";}}catch(e){}})();`,
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
        {/* Splash controller lives here (not in <head>) so the hold/fade
            countdown starts as soon as the splash mounts — i.e. at first
            paint — instead of waiting for the full DOM to parse. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){function done(){var s=document.getElementById("splash");if(s){s.classList.add("is-done");setTimeout(function(){s.style.display="none"},700)}var m=document.getElementById("app-main");if(m)m.classList.add("is-ready")}requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(done,800)})})}();`,
          }}
        />
        <NavbarGate />
        <main id="app-main" suppressHydrationWarning>{children}</main>
        <SmoothScroll />
        <Footer />
        <AIChatLazy />
        <BackToTop />
      </body>
    </html>
  );
}
