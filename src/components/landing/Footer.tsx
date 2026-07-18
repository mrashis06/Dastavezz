'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0a] py-16 px-6 select-none">
      <div className="max-w-[1200px] mx-auto">

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 pb-10 border-b border-slate-100 dark:border-white/[0.05]">

          {/* Brand */}
          <div className="space-y-3 max-w-xs">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-white dark:text-slate-900" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Dastavezz</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-600 leading-relaxed">
              AI-powered document workspace for writing, formatting, and exporting professional documents.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-12">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">Product</p>
              <ul className="space-y-2.5">
                <li><Link href="/dashboard" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 font-medium">Dashboard</Link></li>
                <li><a href="#features" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 font-medium">Features</a></li>
                <li><a href="#templates" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 font-medium">Templates</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">Project</p>
              <ul className="space-y-2.5">
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 font-medium">GitHub</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-[11px] text-slate-400 dark:text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} Dastavezz. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-600 font-medium flex items-center gap-1.5">
            Made with <span className="text-red-400">❤️</span> Dastavezz
          </p>
        </div>
      </div>
    </footer>
  );
}
