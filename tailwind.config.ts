import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          2: "#222222",
          3: "#444444",
        },
        muted: "#8a8a8a",
        line: {
          DEFAULT: "#e6e6e6",
          2: "#d0d0d0",
        },
        paper: {
          DEFAULT: "#fafafa",
          2: "#f1f0ec",
        },
        card: "#ffffff",
        red: "#e63946",
        purple: "#8e3bd6",
        orange: "#ff7a1a",
        green: "#1fa56a",
        yellow: "#ffcf2e",
        blue: "#1d6fe0",
        pink: "#ff5da2",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        micro: ["10.5px", { lineHeight: "1.3", letterSpacing: "0.06em" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      borderRadius: {
        pill: "99px",
      },
      boxShadow: {
        press: "0 2px 0 #0a0a0a",
      },
    },
  },
  plugins: [],
};
export default config;
