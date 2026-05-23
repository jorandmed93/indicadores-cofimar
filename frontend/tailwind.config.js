/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cofimar: {
          bg: "#0A1628",       // Deep navy
          surface: "#0F2240",  // Slate blue surface
          primary: "#00C9A7",  // Teal primary
          accent: "#F5A623",   // Amber accent
          text: "#E8F0FE",     // Ice white text
          success: "#22C55E",  // Success green
          warning: "#F59E0B",  // Warning yellow
          danger: "#EF4444",   // Danger red
          border: "#1E293B"    // Slate border
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
