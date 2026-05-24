/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cofimar: {
          bg: "var(--cofimar-bg)",
          surface: {
            DEFAULT: "var(--cofimar-surface)",
            secondary: "var(--cofimar-surface-secondary)",
            hover: "var(--cofimar-surface-hover)",
            active: "var(--cofimar-surface-active)",
            "active-text": "var(--cofimar-surface-active-text)",
          },
          primary: "var(--cofimar-primary)",
          accent: "var(--cofimar-accent)",
          border: "var(--cofimar-border)",
          text: {
            DEFAULT: "var(--cofimar-text)",
            secondary: "var(--cofimar-text-secondary)",
            muted: "var(--cofimar-text-muted)",
            faint: "var(--cofimar-text-faint)",
          },
          badge: {
            bg: "var(--cofimar-badge-bg)",
            text: "var(--cofimar-badge-text)",
          },
          panel: {
            bg: "var(--cofimar-panel-bg)",
          },
          success: "#34C759",
          warning: "#FF9500",
          danger: "#FF3B30",
        }
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
