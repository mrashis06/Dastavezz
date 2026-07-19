'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DastavezzIcon from './DastavezzIcon';

interface BrandLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function BrandLoader({
  message = 'Loading workspace...',
  fullScreen = true,
}: BrandLoaderProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0c] text-white select-none overflow-hidden'
    : 'min-h-[380px] w-full flex flex-col items-center justify-center bg-transparent select-none';

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center justify-center space-y-6">
        
        {/* Ambient Glowing Aura */}
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0.3 }}
            animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-36 w-36 rounded-full bg-gradient-to-tr from-blue-600/30 via-violet-600/30 to-purple-600/30 blur-3xl pointer-events-none"
          />

          {/* Centered Dastavezz Icon floating animation */}
          <motion.div
            initial={{ y: 0, scale: 0.95 }}
            animate={{ y: [-4, 4, -4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 filter drop-shadow-[0_10px_25px_rgba(37,99,235,0.4)]"
          >
            <DastavezzIcon size={64} />
          </motion.div>
        </div>

        {/* Text Message */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col items-center space-y-3"
        >
          <span className="text-xs font-bold text-slate-300 tracking-[0.25em] uppercase font-sans">
            {message}
          </span>

          {/* Sleek 2-Second Animated Progress Bar */}
          <div className="w-40 h-1 bg-white/[0.08] rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 rounded-full"
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
