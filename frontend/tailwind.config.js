/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D2E5C",
        secondary: "#1A4B8C",
        accent: "#2E7CF6",
        surface: "#EBF2FF",
        bg: "#F8FAFF",
        text: "#1A1A2E",
        muted: "#64748B",
        border: "#CBD5E1",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
