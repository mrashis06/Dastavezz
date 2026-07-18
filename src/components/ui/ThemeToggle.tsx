'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

type Theme = 'light' | 'dark' | 'system';

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light',  label: 'Light',  icon: <Sun className="h-3.5 w-3.5" /> },
  { value: 'dark',   label: 'Dark',   icon: <Moon className="h-3.5 w-3.5" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-3.5 w-3.5" /> },
];

interface ThemeToggleProps {
  /** 'icon' = just a rotating sun/moon button; 'menu' = dropdown with all three options */
  variant?: 'icon' | 'menu';
  className?: string;
}

export default function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (variant === 'icon') {
    const isDark = resolvedTheme === 'dark';
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.15] hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all duration-200 cursor-pointer select-none ${className}`}
        aria-label="Toggle theme"
      >
        <span className="transition-transform duration-300" style={{ display: 'flex', transform: isDark ? 'rotate(20deg)' : 'rotate(0deg)' }}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </span>
      </button>
    );
  }

  // ── Menu variant ──
  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center space-x-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.05] text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.15] transition-all duration-200 cursor-pointer select-none"
        aria-label="Theme selector"
      >
        <span className="flex">{current.icon}</span>
        <span>{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1e1e24] shadow-xl shadow-black/10 dark:shadow-black/40 py-1 z-50">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setTheme(opt.value); setOpen(false); }}
              className={`flex items-center space-x-2.5 w-full px-3 py-2 text-[11px] font-medium cursor-pointer transition-colors duration-150
                ${theme === opt.value
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                }`}
            >
              <span className="flex">{opt.icon}</span>
              <span>{opt.label}</span>
              {theme === opt.value && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
