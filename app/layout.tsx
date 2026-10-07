import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Atkinson_Hyperlegible,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";

// ── Google Fonts — Design.md §4 ──────────────────────────────────────────────

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const body = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const deva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "700"],
  variable: "--font-deva",
  display: "swap",
  preload: false, // loaded on demand when Devanagari text is present
});

// ── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    template: "%s — Sochi",
    default: "Sochi — Housing Society Complaint Management",
  },
  description:
    "Raise and track maintenance complaints for your housing society. " +
    "Available in English, Hindi, and Marathi.",
  keywords: ["society", "complaint", "housing", "maintenance", "RWA"],
  authors: [{ name: "Sochi" }],
  robots: "noindex, nofollow", // private app — no public indexing
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sochi",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)",  color: "#161511" },
  ],
};

// ── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning // required by next-themes to avoid flash
      className={`${display.variable} ${body.variable} ${deva.variable}`}
    >
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
