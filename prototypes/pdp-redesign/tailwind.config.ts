import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Matches the existing customer webapp's --primary token (oklch(0.55 0.17 152)).
        brand: {
          50: "#eafaf1",
          100: "#d1f2df",
          400: "#3fbf76",
          500: "#1fa85c",
          600: "#0f9d58",
          700: "#0b7f47",
        },
      },
      keyframes: {
        "pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(0.94)" },
          "100%": { transform: "scale(1)" },
        },
        "toast-in": {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        pop: "pop 0.25s ease-out",
        "toast-in": "toast-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
