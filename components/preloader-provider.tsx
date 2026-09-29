"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WordPreloader } from "@/components/ui/word-preloader";

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Check if session has already seen the preloader
    const hasSeen = sessionStorage.getItem("sochi_preloader_seen");
    if (hasSeen) {
      setShowPreloader(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowPreloader(false);
      sessionStorage.setItem("sochi_preloader_seen", "1");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showPreloader && <WordPreloader key="preloader" />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: showPreloader ? 0.2 : 0 }}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </>
  );
}
