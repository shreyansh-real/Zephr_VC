"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

// Words cycling in multiple languages — Hello in each
const WORDS = [
  { word: "Hello",       lang: "English"   },
  { word: "नमस्ते",     lang: "Hindi"     },
  { word: "نمستے",      lang: "Urdu"      },
  { word: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", lang: "Punjabi" },
  { word: "નમસ્તે",    lang: "Gujarati"  },
  { word: "வணக்கம்",   lang: "Tamil"     },
  { word: "నమస్కారం",  lang: "Telugu"    },
  { word: "ಹಲೋ",        lang: "Kannada"   },
  { word: "ഹലോ",        lang: "Malayalam" },
  { word: "আদাব",       lang: "Bengali"   },
  { word: "Sochi",       lang: ""          },
];

// Curved SVG path used for the text-reveal wipe (Dennis Snellenberg style)
const CURVE_HEIGHT = 80;

function getClipPath(progress: number, direction: "in" | "out"): string {
  // progress 0→1 reveals the word; progress 0→1 for out hides it
  const offset = direction === "in" ? 1 - progress : progress;
  const y = offset * 100;
  const curveY = y - CURVE_HEIGHT * Math.sin(Math.PI * progress);
  return `polygon(0% ${y}%, 100% ${y}%, 100% ${curveY}%, 0% ${curveY}%)`;
}

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex]       = useState(0);
  const [phase, setPhase]       = useState<"in" | "hold" | "out">("in");
  const [isDone, setIsDone]     = useState(false);
  const rafRef                  = useRef<number | null>(null);
  const startRef                = useRef<number | null>(null);

  // Timing constants (ms)
  const IN_DURATION   = 420;
  const HOLD_DURATION = 280;
  const OUT_DURATION  = 380;
  const LAST_HOLD     = 700; // extra hold on "Sochi"

  useEffect(() => {
    let cancelled = false;

    function animate(ts: number) {
      if (cancelled) return;
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;

      setPhase((prev) => prev); // trigger re-render — actual phase logic below
    }

    // Drive word sequence with timeouts
    let idx = 0;

    function next() {
      if (cancelled) return;
      if (idx >= WORDS.length) {
        // All done — fade out the whole preloader
        setIsDone(true);
        setTimeout(() => {
          if (!cancelled) onComplete();
        }, 650);
        return;
      }

      setIndex(idx);
      setPhase("in");

      const isLast = idx === WORDS.length - 1;
      const holdDuration = isLast ? LAST_HOLD : HOLD_DURATION;

      setTimeout(() => {
        if (cancelled) return;
        setPhase("hold");

        setTimeout(() => {
          if (cancelled) return;
          setPhase("out");

          setTimeout(() => {
            if (cancelled) return;
            idx++;
            next();
          }, OUT_DURATION);
        }, holdDuration);
      }, IN_DURATION);
    }

    next();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const word = WORDS[index];

  // Letter-by-letter stagger variants
  const letterVariants: Variants = {
    hidden: { y: 80, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.35,
        delay: i * 0.045,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
    exit: (i: number) => ({
      y: -80,
      opacity: 0,
      transition: {
        duration: 0.28,
        delay: i * 0.03,
        ease: [0.55, 0, 1, 0.45] as [number, number, number, number],
      },
    }),
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#1A1A18" }}
        >
          {/* Curved wipe overlay — top half */}
          <motion.div
            key={`wipe-top-${index}-${phase}`}
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{ background: "#1A1A18", zIndex: 10 }}
            animate={
              phase === "in"
                ? { height: "0%" }
                : phase === "out"
                ? { height: "50%" }
                : { height: "0%" }
            }
            transition={{ duration: phase === "in" ? IN_DURATION / 1000 : OUT_DURATION / 1000, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Word display */}
          <div className="relative flex flex-col items-center gap-3 select-none">
            {/* Main word */}
            <div
              className="overflow-hidden flex items-center justify-center"
              aria-live="polite"
              aria-label={word.word}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${index}-${word.word}`}
                  className="flex"
                  initial="hidden"
                  animate={phase === "out" ? "exit" : "visible"}
                  exit="exit"
                >
                  {word.word.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterVariants}
                      className="inline-block font-black leading-none tracking-tight"
                      style={{
                        fontSize: "clamp(3rem, 10vw, 7rem)",
                        color: "#f5f0e8",
                        fontFamily: "var(--font-display, Arial, sans-serif)",
                        // last word "Sochi" gets accent color
                        ...(index === WORDS.length - 1 ? { color: "#1137DE" } : {}),
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Language label */}
            <AnimatePresence mode="wait">
              {word.lang && (
                <motion.span
                  key={`lang-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.4, y: 0, transition: { duration: 0.3, delay: 0.15 } }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: "#5f5b51" }}
                >
                  {word.lang}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar at the bottom */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{ background: "#1137DE" }}
            initial={{ width: "0%" }}
            animate={{ width: `${((index + 1) / WORDS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/* Corner brand mark */}
          <div
            className="absolute bottom-6 right-6 text-xs font-black tracking-widest uppercase"
            style={{ color: "#3b372f" }}
          >
            Sochi
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
