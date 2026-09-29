"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const beams = [
    { initialX: 40,   translateX: 40,   duration: 6, repeatDelay: 2, delay: 1 },
    { initialX: 250,  translateX: 250,  duration: 5, repeatDelay: 3, delay: 3,   className: "h-10" },
    { initialX: 500,  translateX: 500,  duration: 7, repeatDelay: 4,              className: "h-16" },
    { initialX: 750,  translateX: 750,  duration: 4, repeatDelay: 3, delay: 2 },
    { initialX: 950,  translateX: 950,  duration: 8, repeatDelay: 2,              className: "h-20" },
    { initialX: 1150, translateX: 1150, duration: 5, repeatDelay: 3, delay: 1,   className: "h-12" },
  ];

  return (
    <div
      ref={parentRef}
      className={cn(
        "relative flex flex-col items-center w-full justify-center overflow-hidden",
        className
      )}
    >
      {beams.map((beam, index) => (
        <CollisionMechanism
          key={beam.initialX + "beam-idx" + index}
          beamOptions={beam}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}

      {children}

      {/* Collision target sits flush at the very bottom of the section */}
      <div
        ref={containerRef}
        className="absolute bottom-0 w-full inset-x-0 pointer-events-none h-px"
      />
    </div>
  );
};

const CollisionMechanism = ({
  parentRef,
  containerRef,
  beamOptions = {},
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  parentRef: React.RefObject<HTMLDivElement | null>;
  beamOptions?: {
    initialX?: number;
    translateX?: number;
    initialY?: number;
    translateY?: number;
    rotate?: number;
    className?: string;
    duration?: number;
    delay?: number;
    repeatDelay?: number;
  };
}) => {
  const beamRef = useRef<HTMLDivElement>(null);
  const [collision, setCollision] = useState<{
    detected: boolean;
    coordinates: { x: number; y: number } | null;
  }>({ detected: false, coordinates: null });
  const [beamKey, setBeamKey] = useState(0);
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

  // Measure how far the beam needs to travel so it always reaches the bottom
  const [travelY, setTravelY] = useState("1800px");

  useEffect(() => {
    const measure = () => {
      if (parentRef.current && beamRef.current) {
        const parentH = parentRef.current.getBoundingClientRect().height;
        const beamH = beamRef.current.getBoundingClientRect().height;
        // Start fully above the top, end fully below the bottom
        setTravelY(`${parentH + beamH + 32}px`);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [parentRef]);

  useEffect(() => {
    const checkCollision = () => {
      if (
        beamRef.current &&
        containerRef.current &&
        parentRef.current &&
        !cycleCollisionDetected
      ) {
        const beamRect = beamRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();

        if (beamRect.bottom >= containerRect.top) {
          const relativeX =
            beamRect.left - parentRect.left + beamRect.width / 2;
          const relativeY = beamRect.bottom - parentRect.top;

          setCollision({
            detected: true,
            coordinates: { x: relativeX, y: relativeY },
          });
          setCycleCollisionDetected(true);
        }
      }
    };

    const animationInterval = setInterval(checkCollision, 50);
    return () => clearInterval(animationInterval);
  }, [cycleCollisionDetected, containerRef, parentRef]);

  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      const t1 = setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycleCollisionDetected(false);
      }, 1800);

      const t2 = setTimeout(() => {
        setBeamKey((prev) => prev + 1);
      }, 1800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [collision]);

  return (
    <>
      <motion.div
        key={beamKey}
        ref={beamRef}
        animate="animate"
        initial={{
          translateY: beamOptions.initialY ?? "-150px",
          translateX: beamOptions.initialX ?? "0px",
          rotate: beamOptions.rotate ?? 0,
        }}
        variants={{
          animate: {
            translateY: beamOptions.translateY ?? travelY,
            translateX: beamOptions.translateX ?? "0px",
            rotate: beamOptions.rotate ?? 0,
          },
        }}
        transition={{
          duration: beamOptions.duration ?? 6,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          delay: beamOptions.delay ?? 0,
          repeatDelay: beamOptions.repeatDelay ?? 0,
        }}
        className={cn(
          "absolute left-0 top-0 m-auto h-16 w-px rounded-full bg-gradient-to-t from-[var(--critical)] via-[var(--high)] to-transparent opacity-80",
          beamOptions.className
        )}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
  const spans = Array.from({ length: 16 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 60 - 30),
    directionY: Math.floor(Math.random() * -40 - 10),
  }));

  return (
    <div {...props} className={cn("absolute z-30 h-2 w-2 pointer-events-none", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute -top-px left-0 m-auto h-px w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--critical)] to-transparent"
      />
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{ x: span.directionX, y: span.directionY, opacity: 0 }}
          transition={{ duration: Math.random() * 1.2 + 0.4, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-[var(--critical)] to-[var(--high)]"
        />
      ))}
    </div>
  );
};
