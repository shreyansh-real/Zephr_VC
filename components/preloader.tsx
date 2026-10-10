"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WORDS = [
  { word: "Hello",        lang: "English"   },
  { word: "नमस्ते",      lang: "Hindi"     },
  { word: "نمستے",       lang: "Urdu"      },
  { word: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", lang: "Punjabi"  },
  { word: "નમસ્તે",     lang: "Gujarati"  },
  { word: "வணக்கம்",    lang: "Tamil"     },
  { word: "నమస్కారం",   lang: "Telugu"    },
  { word: "ಹಲೋ",         lang: "Kannada"   },
  { word: "ഹലോ",         lang: "Malayalam" },
  { word: "আদাব",        lang: "Bengali"   },
  { word: "Sochi",        lang: ""          },
];

// Timing (ms) — fast and snappy, preloader moves quick
const IN_MS   = 180;  // word slides in — faster reveal
const HOLD_MS = 150;  // word holds visible — brief pause
const OUT_MS  = 140;  // word slides out — quick exit
const LAST_HOLD_MS = 300; // extra hold on "Sochi"
const EXIT_MS = 350;  // full-screen fade-out

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [index,  setIndex]  = useState(0);
  // phase drives which animation state the word is in
  const [phase,  setPhase]  = useState<"in" | "hold" | "out">("in");
  const [done,   setDone]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idx = 0;

    function step() {
      if (cancelled) return;
      if (idx >= WORDS.length) {
        setDone(true);
        setTimeout(() => { if (!cancelled) onComplete(); }, EXIT_MS);
        return;
      }

      setIndex(idx);
      setPhase("in");

      const hold = idx === WORDS.length - 1 ? LAST_HOLD_MS : HOLD_MS;

      setTimeout(() => {
        if (cancelled) return;
        setPhase("hold");
        setTimeout(() => {
          if (cancelled) return;
          setPhase("out");
          setTimeout(() => {
            idx++;
            step();
          }, OUT_MS);
        }, hold);
      }, IN_MS);
    }

    step();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const word    = WORDS[index];
  const isLast  = index === WORDS.length - 1;
  const isOut   = phase === "out";

  // Single word translate — GPU composited, smooth easing
  const wordAnim = {
    initial:  { y: "50%", opacity: 0 },
    animate:  isOut
      ? { y: "-50%", opacity: 0,
          transition: { duration: OUT_MS / 1000, ease: [0.4, 0, 0.6, 1] as const } }
      : { y: "0%",   opacity: 1,
          transition: { duration: IN_MS / 1000,  ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader-shell"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: EXIT_MS / 1000, ease: "easeInOut" } }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#1A1A18", willChange: "opacity" }}
        >
          {/* Word + language label — centred, overflow hidden so translate clips cleanly */}
          <div className="flex flex-col items-center gap-2 select-none">
            {/* Word */}
            <div className="overflow-hidden" style={{ lineHeight: 1 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={`${index}-word`}
                  initial={wordAnim.initial}
                  animate={wordAnim.animate}
                  className="block font-black leading-none tracking-tight"
                  style={{
                    fontSize: "clamp(3.5rem, 11vw, 7.5rem)",
                    color: isLast ? "#FAF8F3" : "#f5f0e8", // warm white for Sochi
                    fontFamily: "var(--font-display, 'Arial Black', Arial, sans-serif)",
                    willChange: "transform, opacity",
                  }}
                >
                  {word.word}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Language label */}
            <div className="overflow-hidden h-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {word.lang && (
                  <motion.span
                    key={`${index}-lang`}
                    initial={{ y: "40%", opacity: 0 }}
                    animate={{ y: "0%",   opacity: 0.38,
                      transition: { duration: 0.28, delay: 0.12, ease: "easeOut" } }}
                    exit={{    y: "-40%", opacity: 0,
                      transition: { duration: 0.2, ease: "easeIn" } }}
                    className="block text-[11px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: "#5f5b51" }}
                  >
                    {word.lang}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Footer branding */}
          <div
            className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-bold tracking-wide"
            style={{ color: "#5f5b51" }}
          >
            © 2026 Sochi. All rights reserved.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
