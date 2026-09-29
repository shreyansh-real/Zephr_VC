"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTheme } from "next-themes";

const BEZIER_EASE = [0.76, 0, 0.24, 1] as const;
const WORD_EASE = [0.33, 1, 0.68, 1] as const;

export const PRELOADER_WORDS = [
  "hello",
  "bonjour",
  "namaste",
];

interface WordPreloaderProps {
  onComplete?: () => void;
  duration?: number;
}

export function WordPreloader({ onComplete, duration = 1200 }: WordPreloaderProps) {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();

  // Color theme matching website's warm palette
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (resolvedTheme === "dark") {
      setIsDark(true);
    } else if (resolvedTheme === "light") {
      setIsDark(false);
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, [resolvedTheme, isClient]);

  // Faster word cycling
  useEffect(() => {
    if (index === PRELOADER_WORDS.length - 1) return;

    const wordInterval = Math.max(280, Math.floor(duration / PRELOADER_WORDS.length));
    const timeout = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, wordInterval);

    return () => clearTimeout(timeout);
  }, [index, duration]);

  // Downward slide towards bottom border of website with top curve
  const initialCurve = `M0 300 Q${dimension.width / 2} 300 ${dimension.width} 300 L${dimension.width} ${
    dimension.height + 300
  } L0 ${dimension.height + 300} Z`;

  const targetCurve = `M0 300 Q${dimension.width / 2} 0 ${dimension.width} 300 L${dimension.width} ${
    dimension.height + 300
  } L0 ${dimension.height + 300} Z`;

  // Curtain slides DOWN to bottom border of the screen (+100vh)
  const containerVariants: Variants = {
    initial: {
      top: 0,
    },
    exit: {
      top: "100vh",
      transition: {
        duration: 0.7,
        ease: BEZIER_EASE,
        delay: 0.15,
      },
    },
  };

  const curveVariants: Variants = {
    initial: {
      d: initialCurve,
      transition: { duration: 0.6, ease: BEZIER_EASE },
    },
    exit: {
      d: targetCurve,
      transition: { duration: 0.6, ease: BEZIER_EASE },
    },
  };

  const currentWord = PRELOADER_WORDS[index] ?? PRELOADER_WORDS[0];
  
  // Exact website warm off-white (#F5EFE3 in light, #151514 in dark)
  const bgFill = isDark ? "#151514" : "#F5EFE3";
  const textColor = isDark ? "text-[#F7F3E9]" : "text-[#1A1A18]";
  const dotColor = isDark ? "bg-[#C2BDAF]" : "bg-[#524E40]";

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      exit="exit"
      onAnimationComplete={(definition) => {
        if (definition === "exit" && onComplete) {
          onComplete();
        }
      }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center cursor-wait overflow-hidden select-none"
      style={{
        backgroundColor: bgFill,
        height: "100vh",
        width: "100vw",
      }}
    >
      {dimension.width > 0 && (
        <>
          {/* Top curve SVG creating the downward sweep effect */}
          <svg
            className="absolute -top-[300px] pointer-events-none w-full"
            style={{ height: "calc(100% + 300px)" }}
          >
            <motion.path
              variants={curveVariants}
              initial="initial"
              exit="exit"
              fill={bgFill}
            />
          </svg>

          {/* Center words display */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-6 text-center">
            {/* Word reveal with center-to-bottom exit flow */}
            <div className="h-24 sm:h-28 md:h-32 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWord}
                  initial={{ opacity: 0, y: 25, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 25, scale: 0.97 }}
                  transition={{
                    duration: 0.22,
                    ease: WORD_EASE,
                  }}
                  className="flex items-center gap-3"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor} opacity-70`} />
                  <h1
                    className={`text-5xl sm:text-7xl md:text-8xl font-display font-bold tracking-tight lowercase ${textColor}`}
                  >
                    {currentWord}
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Clean minimal indicator line */}
            <div className="w-16 sm:w-24 h-[2px] rounded-full bg-[var(--border-token)] overflow-hidden">
              <motion.div
                className={`h-full ${isDark ? "bg-[#F7F3E9]" : "bg-[#1A1A18]"}`}
                initial={{ width: "0%" }}
                animate={{ width: `${((index + 1) / PRELOADER_WORDS.length) * 100}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
