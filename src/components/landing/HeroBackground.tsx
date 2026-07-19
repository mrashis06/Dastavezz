'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export default function HeroBackground() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Mouse position tracking for subtle spotlight radial glow
  const [mousePosPercent, setMousePosPercent] = useState({ x: 50, y: 35 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (shouldReduceMotion) return;
      const { innerWidth, innerHeight } = window;
      setMousePosPercent({
        x: Math.round((e.clientX / innerWidth) * 100),
        y: Math.round((e.clientY / innerHeight) * 100),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion]);

  // Scroll Parallax
  const glowY = useTransform(scrollY, [0, 600], [0, -20]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      
      {/* ── 1. MOUSE RADIAL LIGHT ILLUMINATION ──────────────────────────── */}
      {!shouldReduceMotion && (
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{
            background: `radial-gradient(650px circle at ${mousePosPercent.x}% ${mousePosPercent.y}%, rgba(124, 58, 237, 0.05), transparent 75%)`,
          }}
        />
      )}

      {/* ── 2. MAIN BREATHING AMBIENT GLOW ──────────────────────────────── */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : glowY }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[950px] h-[450px] sm:h-[550px] rounded-full bg-gradient-to-tr from-violet-600/12 via-indigo-600/10 to-blue-600/08 dark:from-violet-500/16 dark:via-indigo-500/12 dark:to-blue-500/10 blur-[150px] will-change-transform"
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: [0.97, 1.03, 0.97],
                opacity: [0.6, 0.85, 0.6],
              }
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ── 3. FAINT NOISE TEXTURE OVERLAY ────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none mix-blend-overlay">
        <filter id="heroCleanNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#heroCleanNoise)" />
      </svg>
    </div>
  );
}
