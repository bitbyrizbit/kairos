import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#080808",
          secondary: "#0d0d0d",
          card: "#0a0a0a",
          hover: "#141414",
        },
        risk: {
          red: "#ef4444",
          orange: "#f97316",
          amber: "#f59e0b",
          green: "#22c55e",
        },
      },
    },
  },
  plugins: [],
}

export default config
