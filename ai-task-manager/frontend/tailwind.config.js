/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "Plus Jakarta Sans",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        body: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          DEFAULT: "#6366f1",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#312e81",
        },
        surface: {
          50: "rgba(255, 255, 255, 0.72)",
          100: "rgba(255, 255, 255, 0.88)",
        },
      },
      boxShadow: {
        brand: "0 25px 45px -30px rgba(79, 70, 229, 0.55)",
        card: "0 18px 45px -28px rgba(15, 23, 42, 0.35)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "hero-aurora":
          "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(56,189,248,0.08))",
      },
    },
  },
  plugins: [],
};
