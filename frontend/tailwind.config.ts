import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0052FF", // Base Blue (Official)
          black: "#050608",
          gray: "#F5F5F5",
        }
      }
    },
  },
  plugins: [],
};

export default config;
