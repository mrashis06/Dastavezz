import React from 'react';
import DastavezzIcon from './DastavezzIcon';

interface LogoProps {
  iconSize?: number;
  showTagline?: boolean;
  className?: string;
}

export default function DastavezzLogo({
  iconSize = 32,
  showTagline = false,
  className = '',
}: LogoProps) {
  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      <DastavezzIcon size={iconSize} />
      <div className="flex flex-col">
        <span className="text-sm md:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">
          Dastavezz
        </span>
        {showTagline && (
          <span className="text-[8px] font-extrabold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mt-1">
            Smart Documents. Better Impact.
          </span>
        )}
      </div>
    </div>
  );
}
