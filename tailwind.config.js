/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      xs: ["0.875rem", { lineHeight: "1.25rem" }],
      sm: ["1rem", { lineHeight: "1.5rem" }],
      base: ["1.125rem", { lineHeight: "1.75rem" }],
      lg: ["1.25rem", { lineHeight: "1.75rem" }],
      xl: ["1.5rem", { lineHeight: "2rem" }],
      "2xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "4xl": ["3rem", { lineHeight: "1" }],
      "5xl": ["3.75rem", { lineHeight: "1" }],
      "6xl": ["4.5rem", { lineHeight: "1" }],
      "7xl": ["5rem", { lineHeight: "1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
      "9xl": ["8rem", { lineHeight: "1" }],
    },
    extend: {
      colors: {
        primary: "#2E57A9",
      },
    },
  },
  plugins: [],
};
