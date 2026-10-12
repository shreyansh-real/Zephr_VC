"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguageStore } from "@/lib/language-store";
import { type Language } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES: { code: Language; name: string }[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "mr", name: "मराठी" },
];

export function LandingNavbar() {
  const { language, setLanguage } = useLanguageStore();
  const { setTheme, resolvedTheme } = useTheme();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  return (
    <nav className="w-full border-b border-[var(--border-token)] bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/sochi-logo.png"
            alt="Sochi Logo"
            width={45}
            height={45}
            className="w-11 h-11"
            priority
          />
        </div>

        {/* Right Side: Language & Theme */}
        <div className="flex items-center gap-4">
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] transition-colors text-sm font-medium text-[var(--ink)]"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language.toUpperCase()}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-40 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg shadow-lg z-50"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        language === lang.code
                          ? "bg-[var(--accent)]/10 text-[var(--accent)] font-semibold"
                          : "text-[var(--ink)] hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md border border-[var(--border-token)] hover:bg-[var(--surface-2)] transition-colors text-[var(--ink)]"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

