"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTheme } from "next-themes";

const BEZIER_EASE = [0.76, 0, 0.24, 1] as const;
const WORD_EASE = [0.33, 1, 0.68, 1] as const;

export const PRELOADER_WORDS = [
  { word: "Hello", lang: "English" },
  { word: "Bonjour", lang: "French" },
  { word: "नमस्ते", lang: "Hindi" },
  { word: "Ciao", lang: "Italian" },
  { word: "Olà", lang: "Portuguese" },
  { word: "やあ", lang: "Japanese" },
  { word: "Guten Tag", lang: "German" },
  { word: "Hola", lang: "Spanish" },
  { word: "Nǐ hǎo", lang: "Mandarin" },
  { word: "Sochi", lang: "Society AI" },
];

interface WordPreloaderProps {
  onComplete?: () => void;
  duration?: number;
}

export function WordPreloader({ onComplete, duration = 2400 }: WordPreloaderProps) {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();

  // Determine dark vs light mode
  const [isDark, setIsDark] = useState(true);

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

  // Word cycling interval
  useEffect(() => {
    if (index === PRELOADER_WORDS.length - 1) return;

    const timeout = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, Math.max(160, Math.floor(duration / PRELOADER_WORDS.length)));

    return () => clearTimeout(timeout);
  }, [index, duration]);

  // SVG curved path calculations (Dennis Snellenberg curve)
  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${
    dimension.height + 300
  } 0 ${dimension.height} L0 0`;

  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${
    dimension.height
  } 0 ${dimension.height} L0 0`;

  const containerVariants: Variants = {
    initial: {
      top: 0,
    },
    exit: {
      top: "-100vh",
      transition: {
        duration: 0.85,
        ease: BEZIER_EASE,
        delay: 0.2,
      },
    },
  };

  const curveVariants: Variants = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: BEZIER_EASE },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: BEZIER_EASE, delay: 0.2 },
    },
  };

  const currentWord = PRELOADER_WORDS[index] ?? PRELOADER_WORDS[0];
  const bgFill = isDark ? "#000000" : "#f8f9fa";
  const textColor = isDark ? "text-[#fafafa]" : "text-[#09090b]";
  const subTextColor = isDark ? "text-neutral-400" : "text-neutral-500";
  const dotColor = isDark ? "bg-emerald-400" : "bg-emerald-500";

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
          {/* Main animated word container */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
            {/* Ambient status dot + language tag */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className={`h-2 w-2 rounded-full ${dotColor} animate-pulse`} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord.lang}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className={`text-[12px] font-mono uppercase tracking-[0.25em] ${subTextColor}`}
                >
                  {currentWord.lang}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* Typography word reveal */}
            <div className="h-20 sm:h-24 md:h-28 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentWord.word}
                  initial={{ opacity: 0, y: 35, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -35, filter: "blur(4px)" }}
                  transition={{
                    duration: 0.28,
                    ease: WORD_EASE,
                  }}
                  className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight ${textColor}`}
                >
                  {currentWord.word}
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* Bottom subtle progress line */}
            <div className="w-24 sm:w-32 h-[2px] rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden mt-4">
              <motion.div
                className={`h-full ${isDark ? "bg-white" : "bg-black"}`}
                initial={{ width: "0%" }}
                animate={{ width: `${((index + 1) / PRELOADER_WORDS.length) * 100}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Dennis Snellenberg curved SVG bottom flap */}
          <svg
            className="absolute top-0 pointer-events-none w-full"
            style={{ height: "calc(100% + 300px)" }}
          >
            <motion.path
              variants={curveVariants}
              initial="initial"
              exit="exit"
              fill={bgFill}
            />
          </svg>
        </>
      )}
    </motion.div>
  );
}
