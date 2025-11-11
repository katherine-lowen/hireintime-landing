// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // 👇 Use tuple form in v4: ["class", "<selector>"]
  darkMode: ["class", ".dark"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;
