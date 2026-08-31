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
              #navbar-logo:not(.is-revealed) { opacity: 0 !important; visibility: hidden !important; }
              #navbar-logo.is-revealed { opacity: 1 !important; visibility: visible !important; transition: opacity 0.25s ease !important; }
              @media (hover: hover) and (pointer: fine) {
                html:not([data-admin]), html:not([data-admin]) body, html:not([data-admin]) #splash {
                  cursor: url("data:image/svg+xml,%3Csvg width='24' height='32' viewBox='0 0 24 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 1.5L1.5 25.5L7.2 20.2L12.4 30.5L16.2 28.6L11 18.3L18.8 18.3L1.5 1.5Z' fill='%23000000' stroke='%23FFFFFF' stroke-width='1.8' stroke-linejoin='miter' stroke-miterlimit='4'/%3E%3C/svg%3E") 0 0, auto !important;
                }
              }
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
          <div id="splash-logo-box">
            <img
              id="splash-logo"
              src="/icon.png"
              alt="Dylan Ramos"
              width={64}
              height={64}
              draggable={false}
              suppressHydrationWarning
            />
          </div>
          <div id="splash-line" />
          <div id="splash-text">Loading</div>
        </div>
        {/* Splash controller: Handles loading countdown and buttery-smooth FLIP animation */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){
              function startFlight(){
                var s = document.getElementById("splash");
                var splashLogo = document.getElementById("splash-logo");
                var navLogo = document.getElementById("navbar-logo");
                var m = document.getElementById("app-main");

                if (splashLogo && navLogo && s) {
                  var sRect = splashLogo.getBoundingClientRect();
                  var nRect = navLogo.getBoundingClientRect();

                  if (nRect.width > 0 && nRect.height > 0) {
                    var clone = splashLogo.cloneNode(true);
                    clone.id = "splash-flying-clone";
                    clone.style.cssText = "position:fixed;left:" + sRect.left + "px;top:" + sRect.top + "px;width:" + sRect.width + "px;height:" + sRect.height + "px;z-index:10000;pointer-events:none;border-radius:12px;will-change:transform,opacity,border-radius;transform-origin:center center;box-shadow:0 10px 30px -10px rgba(0,0,0,0.25);";
                    document.body.appendChild(clone);

                    // Hide original inside splash so only flying clone moves
                    splashLogo.style.opacity = "0";

                    // Center-to-center translation offsets
                    var sCenterX = sRect.left + sRect.width / 2;
                    var sCenterY = sRect.top + sRect.height / 2;
                    var nCenterX = nRect.left + nRect.width / 2;
                    var nCenterY = nRect.top + nRect.height / 2;

                    var dx = nCenterX - sCenterX;
                    var dy = nCenterY - sCenterY;
                    var scaleX = nRect.width / sRect.width;
                    var scaleY = nRect.height / sRect.height;

                    // Trigger ultra-smooth GPU flight with silky Apple bezier
                    requestAnimationFrame(function(){
                      requestAnimationFrame(function(){
                        clone.style.transition = "transform 0.88s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.88s ease, box-shadow 0.88s ease";
                        clone.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0) scale(" + scaleX + ", " + scaleY + ")";
                        clone.style.borderRadius = "6px";
                        clone.style.boxShadow = "none";

                        // Reveal navbar logo exactly as clone reaches the destination
                        setTimeout(function(){
                          if (navLogo) {
                            navLogo.classList.add("is-revealed");
                            navLogo.style.opacity = "1";
                          }
                          if (clone) {
                            clone.style.transition = "opacity 0.12s ease-out";
                            clone.style.opacity = "0";
                          }
                        }, 860);

                        setTimeout(function(){
                          if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
                        }, 1050);
                      });
                    });
                  }
                }

                if (s) {
                  s.classList.add("is-done");
                  setTimeout(function(){ s.style.display = "none"; }, 1050);
                }
                if (m) {
                  m.classList.add("is-ready");
                }
              }

              // Run when DOM and navbar are painted, with an intentional pause (1400ms)
              function checkReady(){
                var navLogo = document.getElementById("navbar-logo");
                if (navLogo && navLogo.getBoundingClientRect().width > 0) {
                  setTimeout(startFlight, 1400);
                } else {
                  setTimeout(checkReady, 50);
                }
              }

              if (document.readyState === "complete") {
                checkReady();
              } else {
                window.addEventListener("load", checkReady);
              }
            }();`,
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
