'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Briefcase, Mail, FileSpreadsheet, FileCode } from 'lucide-react';

interface ElegantCardDef {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  position: { top: string; left?: string; right?: string };
  rotation: number;
  duration: number;
  delay: number;
  floatY: number;
}

const ELEGANT_CARDS: ElegantCardDef[] = [
  {
    id: 'resume',
    title: 'Resume',
    category: 'ATS Format',
    icon: <Briefcase className="h-3.5 w-3.5 text-violet-400" />,
    position: { top: '22%', left: '3%' },
    rotation: -2,
    duration: 16,
    delay: 0,
    floatY: 10,
  },
  {
    id: 'letter',
    title: 'Business Letter',
    category: 'Formal Spec',
    icon: <Mail className="h-3.5 w-3.5 text-emerald-400" />,
    position: { top: '24%', right: '3%' },
    rotation: 2,
    duration: 18,
    delay: 1.2,
    floatY: -10,
  },
  {
    id: 'report',
    title: 'Project Report',
    category: 'Technical',
    icon: <FileSpreadsheet className="h-3.5 w-3.5 text-amber-400" />,
    position: { top: '58%', left: '2%' },
    rotation: 1.5,
    duration: 20,
    delay: 2.4,
    floatY: 8,
  },
  {
    id: 'pdf-doc',
    title: 'PDF Document',
    category: 'Vector Export',
    icon: <FileCode className="h-3.5 w-3.5 text-rose-400" />,
    position: { top: '60%', right: '2%' },
    rotation: -1.5,
    duration: 17,
    delay: 0.8,
    floatY: -10,
  },
];

export default function HeroBackground() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Mouse position tracking for subtle parallax
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [mousePosPercent, setMousePosPercent] = useState({ x: 50, y: 35 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (shouldReduceMotion) return;
      const { innerWidth, innerHeight } = window;
      const offsetX = (e.clientX / innerWidth) - 0.5;
      const offsetY = (e.clientY / innerHeight) - 0.5;
      setMouseOffset({ x: offsetX, y: offsetY });
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
  const paperY = useTransform(scrollY, [0, 600], [0, -12]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      
      {/* ── 1. MOUSE RADIAL LIGHT ILLUMINATION ──────────────────────────── */}
      {!shouldReduceMotion && (
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{
            background: `radial-gradient(600px circle at ${mousePosPercent.x}% ${mousePosPercent.y}%, rgba(124, 58, 237, 0.05), transparent 75%)`,
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

      {/* ── 3. ELEGANT MARGIN DOCUMENT CARDS (EXACTLY 4, FAR MARGINS ONLY) ─ */}
      <motion.div
        style={{
          y: shouldReduceMotion ? 0 : paperY,
          x: mouseOffset.x * 6,
        }}
        className="absolute inset-0 w-full h-full will-change-transform"
      >
        {ELEGANT_CARDS.map((card) => (
          <motion.div
            key={card.id}
            className="hidden lg:block absolute w-44 rounded-2xl border p-4 shadow-xl backdrop-blur-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border-white/[0.08] opacity-[0.14] dark:opacity-[0.18] transition-opacity duration-300 will-change-transform"
            style={{
              top: card.position.top,
              left: card.position.left,
              right: card.position.right,
              transform: `rotate(${card.rotation}deg)`,
            }}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [-card.floatY, card.floatY, -card.floatY],
                    rotate: [card.rotation - 0.8, card.rotation + 0.8, card.rotation - 0.8],
                  }
            }
            transition={{
              duration: card.duration,
              repeat: Infinity,
              delay: card.delay,
              ease: 'easeInOut',
            }}
          >
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2.5">
              <div className="p-1 rounded-md bg-white/[0.08] border border-white/[0.1]">
                {card.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-200 truncate leading-none">
                  {card.title}
                </span>
                <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider leading-tight mt-0.5">
                  {card.category}
                </span>
              </div>
            </div>

            {/* Skeleton lines */}
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-3/4 bg-white/30 rounded-full" />
              <div className="h-1.5 w-full bg-white/15 rounded-full" />
              <div className="h-1.5 w-4/5 bg-white/15 rounded-full" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── 4. FAINT NOISE TEXTURE OVERLAY ────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none mix-blend-overlay">
        <filter id="heroElegantNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#heroElegantNoise)" />
      </svg>
    </div>
  );
}
