export type SiteTheme = "modern" | "cafe" | "cyber";

export interface ThemeConfig {
  id: SiteTheme;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  colors: {
    primary: string;
    accent: string;
    surface: string;
    card: string;
    ink: string;
    darkSurface: string;
    darkCard: string;
    darkInk: string;
  };
  features: string[];
}

export const SITE_THEMES: Record<SiteTheme, ThemeConfig> = {
  modern: {
    id: "modern",
    name: "Modern Minimalist",
    subtitle: "Apple-Style Monochrome",
    description:
      "Ultra-clean typography, monochrome palette, crisp zinc borders, and refined neutral contrast.",
    badge: "DEFAULT",
    colors: {
      primary: "#1d1d1f",
      accent: "#000000",
      surface: "#fbfbfd",
      card: "#ffffff",
      ink: "#1d1d1f",
      darkSurface: "#000000",
      darkCard: "#1d1d1f",
      darkInk: "#f5f5f7",
    },
    features: [
      "Pure monochrome elegance",
      "Subtle graphite lines",
      "High-clarity typography",
      "Minimalist glassmorphism",
    ],
  },
  cafe: {
    id: "cafe",
    name: "Coffee Shop Aesthetic",
    subtitle: "Warm Beige & Roasted Espresso",
    description:
      "Cozy artisan coffee shop aesthetic with warm cream linen, caramel amber accents, and rich dark roast espresso.",
    badge: "COZY VIBE",
    colors: {
      primary: "#c28549",
      accent: "#b4652a",
      surface: "#f8f4ed",
      card: "#fdfbf7",
      ink: "#2c221e",
      darkSurface: "#14100c",
      darkCard: "#241e18",
      darkInk: "#f5eee6",
    },
    features: [
      "Warm steamed milk & oat linen tones",
      "Rich espresso & mocha dark mode",
      "Caramel & amber highlight glows",
      "Cozy artisan card textures",
    ],
  },
  cyber: {
    id: "cyber",
    name: "Cyber Terminal",
    subtitle: "Emerald Matrix HUD & Binary FX",
    description:
      "Futuristic hacker console with deep CRT void black, phosphor emerald text, and raining binary particle effects.",
    badge: "MATRIX FX",
    colors: {
      primary: "#10b981",
      accent: "#00ff66",
      surface: "#eef6f2",
      card: "#f7fbf9",
      ink: "#06291a",
      darkSurface: "#040806",
      darkCard: "#0e1c16",
      darkInk: "#4ade80",
    },
    features: [
      "Deep CRT void pitch black",
      "Phosphor emerald matrix glows (#00ff66)",
      "Live canvas binary rain background",
      "Tactical HUD terminal styling",
    ],
  },
};

export const THEME_STORAGE_KEY = "site_active_theme";

export function isValidTheme(val: unknown): val is SiteTheme {
  return val === "modern" || val === "cafe" || val === "cyber";
}
