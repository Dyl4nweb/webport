import type { Metadata } from "next";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavbarGate from "@/components/layout/NavbarGate";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";
import AIChatLazy from "@/components/ui/AIChatLazy";
import BackToTop from "@/components/ui/BackToTop";
import PublicChromeGate from "@/components/admin/PublicChromeGate";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import ThemeProvider from "@/components/theme/ThemeProvider";
import CyberBinaryFX from "@/components/theme/CyberBinaryFX";
import ThemeAtmosphere from "@/components/theme/ThemeAtmosphere";
import { isValidTheme, type SiteTheme } from "@/lib/theme";
import { getSupabase } from "@/lib/supabase";
import { SITE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serifFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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

async function getAuthoritativeTheme(): Promise<SiteTheme> {
  // 1. Try to read from Supabase (Global database for all visitors)
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("active_theme")
      .eq("id", "global")
      .maybeSingle();

    if (data && isValidTheme(data.active_theme)) {
      return data.active_theme;
    }
  } catch {}

  // 2. Fallback to local settings file
  try {
    const filePath = path.join(process.cwd(), "data", "site_settings.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (isValidTheme(parsed.active_theme)) return parsed.active_theme;
  } catch {}
  return "modern";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("site_active_theme")?.value;
  const authoritativeTheme = await getAuthoritativeTheme();
  const activeTheme = isValidTheme(cookieTheme) ? (cookieTheme as SiteTheme) : authoritativeTheme;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${serifFont.variable} ${monoFont.variable}`}
      data-theme={activeTheme}
      suppressHydrationWarning
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { color-scheme: light dark; }
              #splash { background-color: var(--splash-bg, #fbfbfd); }
              
              /* Modern Minimalist Splash */
              html[data-theme="modern"]:not(.dark) #splash, html:not([data-theme]):not(.dark) #splash, html.light[data-theme="modern"] #splash, html.light:not([data-theme]) #splash { background-color: #fbfbfd !important; }
              html[data-theme="modern"]:not(.dark) #splash-line, html:not([data-theme]):not(.dark) #splash-line { background: rgba(29, 29, 31, 0.08) !important; }
              html[data-theme="modern"]:not(.dark) #splash-line::after, html:not([data-theme]):not(.dark) #splash-line::after { background: #1d1d1f !important; }
              html[data-theme="modern"]:not(.dark) #splash-text, html:not([data-theme]):not(.dark) #splash-text { color: #86868b !important; }

              html[data-theme="modern"].dark #splash, html:not([data-theme]).dark #splash { background-color: #000000 !important; }
              html[data-theme="modern"].dark #splash-line, html:not([data-theme]).dark #splash-line { background: rgba(245, 245, 247, 0.12) !important; }
              html[data-theme="modern"].dark #splash-line::after, html:not([data-theme]).dark #splash-line::after { background: #f5f5f7 !important; }
              html[data-theme="modern"].dark #splash-text, html:not([data-theme]).dark #splash-text { color: #98989d !important; }
              
              /* Coffee Shop Splash */
              html[data-theme="cafe"]:not(.dark) #splash, html.light[data-theme="cafe"] #splash { background-color: #f8f4ed !important; }
              html[data-theme="cafe"]:not(.dark) #splash-line { background: rgba(180, 101, 42, 0.18) !important; }
              html[data-theme="cafe"]:not(.dark) #splash-line::after { background: #b4652a !important; }
              html[data-theme="cafe"]:not(.dark) #splash-text { color: #796153 !important; }

              html[data-theme="cafe"].dark #splash { background-color: #14100c !important; }
              html[data-theme="cafe"].dark #splash-line { background: rgba(248, 244, 237, 0.12) !important; }
              html[data-theme="cafe"].dark #splash-line::after { background: #b4652a !important; }
              html[data-theme="cafe"].dark #splash-text { color: #b8a394 !important; }

              /* Cyber Terminal Splash */
              html[data-theme="cyber"]:not(.dark) #splash, html.light[data-theme="cyber"] #splash { background-color: #e8f4ed !important; }
              html[data-theme="cyber"]:not(.dark) #splash-line { background: rgba(5, 150, 105, 0.22) !important; }
              html[data-theme="cyber"]:not(.dark) #splash-line::after { background: #059669 !important; }
              html[data-theme="cyber"]:not(.dark) #splash-text { color: #1f6848 !important; }

              html[data-theme="cyber"].dark #splash { background-color: #030705 !important; }
              html[data-theme="cyber"].dark #splash-line { background: rgba(0, 255, 102, 0.18) !important; }
              html[data-theme="cyber"].dark #splash-line::after { background: #00ff66 !important; box-shadow: 0 0 12px #00ff66 !important; }
              html[data-theme="cyber"].dark #splash-text { color: #00ff66 !important; text-shadow: 0 0 8px rgba(0, 255, 102, 0.6) !important; }

              .navbar-logo-target:not(.is-revealed), #navbar-logo:not(.is-revealed), #navbar-logo-dock:not(.is-revealed) { opacity: 0 !important; visibility: hidden !important; }
              .navbar-logo-target.is-revealed, #navbar-logo.is-revealed, #navbar-logo-dock.is-revealed { opacity: 1 !important; visibility: visible !important; transition: opacity 0.3s ease !important; }
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
            __html: `(function(){try{var doc=document.documentElement;var matchCookie=document.cookie.match(/(?:^|;\\s*)site_active_theme=([^;]+)/);var cookieTheme=matchCookie?matchCookie[1]:null;var localTheme=null;try{localTheme=localStorage.getItem("site_active_theme");}catch(e){}var domTheme=doc.getAttribute("data-theme");var st=(localTheme==="modern"||localTheme==="cafe"||localTheme==="cyber")?localTheme:((cookieTheme==="modern"||cookieTheme==="cafe"||cookieTheme==="cyber")?cookieTheme:((domTheme==="modern"||domTheme==="cafe"||domTheme==="cyber")?domTheme:"modern"));doc.setAttribute("data-theme",st);try{localStorage.setItem("site_active_theme",st);}catch(e){}try{document.cookie="site_active_theme="+st+";path=/;max-age=31536000;SameSite=Lax";}catch(e){}var storedMode=null;try{storedMode=localStorage.getItem("theme");}catch(e){}var isDark=storedMode==="dark"||(!storedMode&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);doc.classList.remove("theme-swap");var bg="#fbfbfd";if(isDark){doc.classList.add("dark");doc.classList.remove("light");doc.style.colorScheme="dark";bg=st==="cafe"?"#14100c":(st==="cyber"?"#030705":"#000000");}else{doc.classList.remove("dark");doc.classList.add("light");doc.style.colorScheme="light";bg=st==="cafe"?"#f8f4ed":(st==="cyber"?"#e8f4ed":"#fbfbfd");}doc.style.backgroundColor=bg;doc.style.setProperty("--splash-bg",bg);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-text">
        <PublicChromeGate />
        <PageViewTracker />
        <div id="splash" suppressHydrationWarning>
          <div id="splash-logo-box" suppressHydrationWarning>
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
          <div id="splash-line" suppressHydrationWarning />
          <div id="splash-text" suppressHydrationWarning>Loading</div>
        </div>
        {/* Splash controller: Handles loading countdown and buttery-smooth FLIP animation */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){
              if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              window.scrollTo(0, 0);
              if (document.documentElement) document.documentElement.scrollTop = 0;
              if (document.body) document.body.scrollTop = 0;

              var hasFlown = false;

              try {
                var st = document.documentElement.getAttribute("data-theme");
                var splashText = document.getElementById("splash-text");
                if (st === "cyber" && splashText) {
                  var ciphers = "01001011_#*[]><~=";
                  var splashInterval = setInterval(function() {
                    var s = document.getElementById("splash");
                    if (!s || s.classList.contains("is-done")) {
                      clearInterval(splashInterval);
                      return;
                    }
                    var t = "INITIALIZING_SYSTEM";
                    var scrambled = "";
                    for (var i = 0; i < t.length; i++) {
                      scrambled += Math.random() > 0.55 ? ciphers[Math.floor(Math.random() * ciphers.length)] : t[i];
                    }
                    splashText.textContent = scrambled;
                  }, 50);
                }
              } catch(e) {}

              function getVisibleNavLogo(){
                var candidates = document.querySelectorAll(".navbar-logo-target, #navbar-logo, #navbar-logo-dock");
                for (var i = 0; i < candidates.length; i++) {
                  var r = candidates[i].getBoundingClientRect();
                  if (r.width > 0 && r.height > 0) return candidates[i];
                }
                return document.getElementById("navbar-logo") || document.getElementById("navbar-logo-dock");
              }

              function startFlight(){
                if (hasFlown) return;
                hasFlown = true;

                var s = document.getElementById("splash");
                var splashLogo = document.getElementById("splash-logo");
                var navLogo = getVisibleNavLogo();
                var m = document.getElementById("app-main");

                if (splashLogo && navLogo && s) {
                  var sRect = splashLogo.getBoundingClientRect();
                  var nRect = navLogo.getBoundingClientRect();

                  if (nRect.width > 0 && nRect.height > 0) {
                    var clone = splashLogo.cloneNode(true);
                    clone.id = "splash-flying-clone";
                    clone.style.cssText = "position:fixed;left:" + sRect.left + "px;top:" + sRect.top + "px;width:" + sRect.width + "px;height:" + sRect.height + "px;z-index:10000;pointer-events:none;border-radius:12px;will-change:transform,opacity,border-radius,box-shadow;transform-origin:center center;box-shadow:0 10px 30px -10px rgba(0,0,0,0.25);";
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

                    // Trigger calm, slow, and ultra-smooth Apple bezier flight (1.25s)
                    requestAnimationFrame(function(){
                      requestAnimationFrame(function(){
                        clone.style.transition = "transform 1.25s cubic-bezier(0.22, 1, 0.36, 1), border-radius 1.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 1.25s cubic-bezier(0.22, 1, 0.36, 1)";
                        clone.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0) scale(" + scaleX + ", " + scaleY + ")";
                        clone.style.borderRadius = "6px";
                        clone.style.boxShadow = "none";

                        // Reveal navbar logo smoothly right as the clone lands
                        setTimeout(function(){
                          if (navLogo) {
                            navLogo.classList.add("is-revealed");
                            navLogo.style.opacity = "1";
                          }
                          var allLogos = document.querySelectorAll(".navbar-logo-target, #navbar-logo, #navbar-logo-dock");
                          for (var j = 0; j < allLogos.length; j++) {
                            allLogos[j].classList.add("is-revealed");
                            allLogos[j].style.opacity = "1";
                          }
                          if (clone) {
                            clone.style.transition = "opacity 0.18s ease-out";
                            clone.style.opacity = "0";
                          }
                        }, 1200);

                        setTimeout(function(){
                          if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
                        }, 1450);
                      });
                    });
                  }
                }

                if (s) {
                  s.classList.add("is-done");
                  setTimeout(function(){ s.style.display = "none"; }, 1450);
                }
                if (m) {
                  m.classList.add("is-ready");
                }
                window.dispatchEvent(new CustomEvent("splash:ready"));
              }

              // Run when DOM and navbar are painted, synchronized with progress bar completion
              function checkReady(){
                var navLogo = getVisibleNavLogo();
                if (navLogo && navLogo.getBoundingClientRect().width > 0) {
                  setTimeout(startFlight, 1400);
                } else {
                  setTimeout(checkReady, 50);
                }
              }

              // Safety timeout: Maximum 2.4s fallback guarantees home screen always loads smoothly
              setTimeout(startFlight, 2400);

              if (document.readyState === "complete") {
                checkReady();
              } else {
                window.addEventListener("load", checkReady);
              }
            }();`,
          }}
        />
        <NavbarGate />
        <ThemeAtmosphere />
        <main id="app-main" suppressHydrationWarning>{children}</main>
        <SmoothScroll />
        <Footer />
        <AIChatLazy />
        <BackToTop />
        <ThemeProvider />
        <CyberBinaryFX />
      </body>
    </html>
  );
}
