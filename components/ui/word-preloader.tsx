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
  "ciao",
  "olà",
  "konnichiwa",
  "guten tag",
  "hola",
  "nǐ hǎo",
  "sochi",
];

interface WordPreloaderProps {
  onComplete?: () => void;
  duration?: number;
}

export function WordPreloader({ onComplete, duration = 1800 }: WordPreloaderProps) {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();

  // Theme matching website's warm palette
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

  // Multilingual word progression
  useEffect(() => {
    if (index === PRELOADER_WORDS.length - 1) return;

    const interval = Math.max(140, Math.floor(duration / PRELOADER_WORDS.length));
    const timeout = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, interval);

    return () => clearTimeout(timeout);
  }, [index, duration]);

  const w = dimension.width || 1440;
  const h = dimension.height || 900;

  // Dennis Snellenberg curved upward SVG paths (organic circular half-shape bottom curve)
  const initialPath = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h + 450} 0 ${h} L0 0`;
  const targetPath = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h} 0 ${h} L0 0`;

  // Solid screen lifts upward (NO fade out)
  const containerVariants: Variants = {
    initial: {
      y: "0%",
    },
    exit: {
      y: "-100%",
      transition: {
        duration: 0.85,
        ease: BEZIER_EASE,
        delay: 0.12,
      },
    },
  };

  const curveVariants: Variants = {
    initial: {
      d: initialPath,
      transition: { duration: 0.75, ease: BEZIER_EASE },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.75, ease: BEZIER_EASE, delay: 0.12 },
    },
  };

  const currentWord = PRELOADER_WORDS[index] ?? PRELOADER_WORDS[0];

  // Website warm palette (#F5EFE3 in light, #151514 in dark)
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
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center cursor-wait select-none pointer-events-auto"
      style={{
        backgroundColor: bgFill,
        height: "100vh",
        width: "100vw",
      }}
    >
      {/* Center Typography Display */}
      <div className="relative z-20 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="h-24 sm:h-32 md:h-36 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord}
              initial={{ opacity: 0, scale: 0.85, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, y: -25, filter: "blur(4px)" }}
              transition={{
                duration: 0.18,
                ease: WORD_EASE,
              }}
              className="flex items-center gap-3 sm:gap-4"
            >
              <span className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${dotColor} animate-ping opacity-60`} />
              <h1
                className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black tracking-tight lowercase ${textColor}`}
                style={{ letterSpacing: "-0.04em" }}
              >
                {currentWord}
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimal circular progress dots */}
        <div className="flex items-center gap-1.5 mt-2">
          {PRELOADER_WORDS.map((wName, i) => (
            <motion.span
              key={wName}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === index
                  ? isDark
                    ? "w-6 bg-[#F7F3E9]"
                    : "w-6 bg-[#1A1A18]"
                  : isDark
                  ? "w-1.5 bg-[#3D3B36]"
                  : "w-1.5 bg-[#D8CFBB]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* SVG Circular Half-Shape Curved Screen Flap at the bottom */}
      {dimension.width > 0 && (
        <svg
          className="absolute top-0 pointer-events-none w-full"
          style={{ height: "calc(100% + 450px)" }}
        >
          <motion.path
            variants={curveVariants}
            initial="initial"
            exit="exit"
            fill={bgFill}
          />
        </svg>
      )}
    </motion.div>
  );
}
