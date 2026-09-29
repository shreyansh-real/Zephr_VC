"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WordPreloader } from "@/components/ui/word-preloader";
import { LandingHero } from "./landing-hero";
import { NavDock } from "@/components/nav-dock";

export function HomeView() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 1900);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <AnimatePresence mode="wait">
        {showPreloader && (
          <WordPreloader
            key="word-preloader"
            duration={1750}
            onComplete={() => setShowPreloader(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      >
        <LandingHero />
        <NavDock />
      </motion.div>
    </main>
  );
}
