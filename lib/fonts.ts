import {
  JetBrains_Mono as FontMono,
  Plus_Jakarta_Sans as FontSans,
} from "next/font/google"

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
})

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["monospace"],
})
