'use client';

import React from 'react';
import Link from 'next/link';
import DastavezzLogo from '@/components/brand/DastavezzLogo';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0a] py-16 px-6 select-none">
      <div className="max-w-[1200px] mx-auto">

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 pb-10 border-b border-slate-100 dark:border-white/[0.05]">

          {/* Brand */}
          <div className="space-y-3 max-w-xs">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <DastavezzLogo iconSize={28} showTagline={true} />
            </Link>
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
            Generated with Dastavezz
          </p>
        </div>
      </div>
    </footer>
  );
}
