"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // Flatten words with characters
  const fullText = words.map((w) => w.text).join(" ");
  const [displayedTextLength, setDisplayedTextLength] = useState(0);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayedTextLength(index);
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [fullText]);

  // Compute which words/characters are visible
  let charCount = 0;

  return (
    <h1
      className={cn(
        "font-display font-black text-[30px] sm:text-[42px] md:text-[54px] lg:text-[58px] leading-[1.12] tracking-[-0.02em] text-[var(--ink)] inline-block max-w-full break-words",
        className
      )}
    >
      {words.map((wordObj, wIdx) => {
        const wordChars = wordObj.text.split("");
        return (
          <span key={`word-${wIdx}`} className="inline-block whitespace-nowrap">
            {wordChars.map((char, cIdx) => {
              charCount++;
              const isVisible = charCount <= displayedTextLength;
              return (
                <span
                  key={`char-${cIdx}`}
                  className={cn(
                    "transition-opacity duration-150",
                    isVisible ? "opacity-100" : "opacity-0",
                    wordObj.className
                  )}
                >
                  {char}
                </span>
              );
            })}
            {/* Space between words */}
            {(() => {
              charCount++;
              return (
                <span className="inline-block">
                  &nbsp;
                </span>
              );
            })()}
          </span>
        );
      })}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "inline-block w-[3.5px] sm:w-[4px] h-[26px] sm:h-[38px] md:h-[48px] bg-[var(--critical)] align-middle ml-1 rounded-sm",
          cursorClassName
        )}
      />
    </h1>
  );
};

export const TypewriterEffectSmooth = TypewriterEffect;
