// Single source of truth for branding. Edit this file to re-brand the app
// for a different client — colors flow straight into tailwind.config.js.
export const COMPANY = {
  name: "Aurelia Estates",
  logoUrl: "/logo.svg",

  tagline: "Your next address, in your language",

  // Swap for the client's own photography. Unsplash placeholder for now.
  heroImageUrl:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",

  trustPoints: [
    { icon: "Clock", label: "A call back within 60 seconds" },
    { icon: "Languages", label: "Fluent in 7 languages" },
    { icon: "ShieldCheck", label: "Every listing personally verified" },
  ],

  colors: {
    primary: "#0B1F3A", // deep navy — primary buttons, headings
    primaryDark: "#071527", // hover/darker shade
    accent: "#C6A15B", // warm gold — highlights, active states
    accentLight: "#E7D5A8",
    background: "#FAF8F4", // off-white page background
    surface: "#FFFFFF",
    border: "#E7E2D8",
  },
};
