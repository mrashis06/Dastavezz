'use client';

import React from 'react';
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
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-slate-100 select-none'
    : 'min-h-[350px] w-full flex flex-col items-center justify-center bg-transparent select-none';

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center justify-center space-y-5">
        {/* Soft Ambient Glow */}
        <div className="absolute h-28 w-28 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-2xl animate-pulse" />

        {/* Centered D icon with elegant pulse scale animation */}
        <div className="relative transform transition-all duration-700 animate-[pulse_2.5s_cubic-bezier(0.4,0,0.6,1)_infinite]">
          <DastavezzIcon size={56} />
        </div>

        {/* Soft fade message */}
        {message && (
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase opacity-80 animate-pulse">
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
