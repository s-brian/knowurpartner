import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        journal: ["var(--font-journal)", "cursive"],
        letter: ["var(--font-letter)", "system-ui", "sans-serif"]
      },
      colors: {
        paper: {
          DEFAULT: "#faf3e8",
          deep: "#f0e4d2",
          cream: "#fffdf8",
          line: "rgba(180, 140, 100, 0.22)",
          margin: "#e8a598",
          ink: "#3d2f2f",
          muted: "#6b5348",
          pencil: "#8b7355"
        }
      },
      boxShadow: {
        sheet:
          "0 1px 2px rgba(61, 47, 47, 0.06), 0 4px 12px rgba(61, 47, 47, 0.08), 0 12px 28px rgba(90, 70, 50, 0.06)",
        lift: "0 2px 8px rgba(61, 47, 47, 0.12)"
      },
      backgroundImage: {
        "lined-tight":
          "repeating-linear-gradient(transparent, transparent 27px, rgba(180, 140, 100, 0.2) 27px, rgba(180, 140, 100, 0.2) 28px)"
      }
    }
  },
  plugins: []
};

export default config;
