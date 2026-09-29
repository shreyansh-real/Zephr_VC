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
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <AnimatePresence mode="wait">
        {showPreloader && (
          <WordPreloader
            key="word-preloader"
            duration={2300}
            onComplete={() => setShowPreloader(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      >
        <LandingHero />
        <NavDock />
      </motion.div>
    </main>
  );
}
