import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Map all Design.md tokens to Tailwind utility classes
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-inverse": "var(--ink-inverse)",
        muted: "var(--muted)",
        border: "var(--border-token)",
        "border-strong": "var(--border-strong)",
        critical: "var(--critical)",
        "critical-tint": "var(--critical-tint)",
        high: "var(--high)",
        "high-tint": "var(--high-tint)",
        medium: "var(--medium)",
        "medium-tint": "var(--medium-tint)",
        low: "var(--low)",
        "low-tint": "var(--low-tint)",
        resolved: "var(--resolved)",
        "resolved-tint": "var(--resolved-tint)",
        review: "var(--review)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Noto Sans Devanagari", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Noto Sans Devanagari", "system-ui", "sans-serif"],
        deva: ["var(--font-deva)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        chip: "4px",
        btn: "8px",
        card: "12px",
      },
      spacing: {
        // 4px base unit grid
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
      },
      maxWidth: {
        dashboard: "1200px",
        form: "560px",
      },
      minHeight: {
        touch: "44px",   // WCAG minimum tap target
        btn: "48px",     // Primary button spec
        input: "52px",   // Single-line input spec
        textarea: "140px",
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-flash": "borderFlash 1.2s ease-out",
        "count-up": "countUp 0.6s ease-out",
      },
      keyframes: {
        borderFlash: {
          "0%, 100%": { outline: "2px solid transparent" },
          "50%": { outline: "2px solid var(--border-strong)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
