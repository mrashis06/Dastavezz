'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Sparkles } from 'lucide-react';

export default function WorkspacePreview() {
  return (
    <section className="px-4 md:px-8 max-w-[1300px] mx-auto pb-24 select-none relative z-10">
      
      {/* Soft Ambient Halo Behind Preview Mockup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[75%] rounded-full bg-gradient-to-r from-violet-600/15 via-indigo-600/15 to-blue-600/15 blur-3xl pointer-events-none" />

      {/* Floating Mockup Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
        className="relative"
      >
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="relative rounded-2xl border border-slate-200/80 dark:border-white/[0.09] bg-white/95 dark:bg-[#0f0f13]/95 p-3.5 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden"
        >
          {/* Window Header */}
          <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
            {/* Dots */}
            <div className="flex items-center space-x-2 select-none">
              <span className="h-3 w-3 rounded-full bg-rose-500/80"></span>
              <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
              <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
            </div>

            {/* URL Bar */}
            <div className="flex-1 max-w-xs md:max-w-sm mx-auto bg-slate-100 dark:bg-white/[0.03] rounded-lg border border-slate-200/80 dark:border-white/[0.06] text-center text-[11px] py-1 text-slate-500 dark:text-slate-400 font-mono flex items-center justify-center space-x-1.5 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>dastavezz.online/workspace</span>
            </div>

            <div className="w-12"></div>
          </div>

          {/* Browser Workspace Layout Preview */}
          <div className="bg-[#09090c] p-4 rounded-xl border border-white/[0.06] mt-3 grid grid-cols-12 gap-4 text-white pointer-events-none min-h-[460px] select-none shadow-inner">
            
            {/* Editor Preview Container */}
            <div className="col-span-12 lg:col-span-5 bg-[#121216] border border-white/[0.07] rounded-xl p-4 flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center space-x-2">
                  <FileText className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Document Editor</span>
                </div>
                <div className="h-3 w-12 bg-white/[0.06] rounded"></div>
              </div>
              <div className="space-y-2.5 flex-1 font-mono text-[10.5px] text-slate-300 leading-relaxed">
                <div className="text-white font-bold"># Professional Resume Outline</div>
                <div className="text-violet-400 font-semibold">## Executive Summary</div>
                <div className="text-slate-400">Results-driven software engineer with 5+ years of experience compiling performant web apps.</div>
                <div className="text-violet-400 font-semibold">## Tech Stack</div>
                <div className="text-slate-400">- TypeScript, React, Next.js, CSS</div>
                <div className="text-slate-400">- Tailwind, Python, Gemini API</div>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-white/[0.06] pt-2">
                <span>Words: 42</span>
                <span className="bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded border border-violet-500/20 font-semibold">Markdown Active</span>
              </div>
            </div>

            {/* Live Preview Container */}
            <div className="col-span-12 lg:col-span-4 bg-[#121216] border border-white/[0.07] rounded-xl p-4 flex flex-col items-center">
              <div className="flex items-center justify-between w-full border-b border-white/[0.06] pb-2.5 mb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Preview</span>
                </div>
                <div className="h-3 w-16 bg-white/[0.06] rounded"></div>
              </div>
              <div className="w-full bg-[#18181f] border border-white/[0.08] rounded-xl shadow-lg p-5 flex flex-col space-y-4 text-slate-200 min-h-[300px]">
                <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase font-mono">Dastavezz Preview</span>
                  <span className="text-[8px] text-slate-400 font-mono">My_Resume</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  <div className="h-3.5 w-2/3 bg-white/[0.9] rounded"></div>
                  <div className="h-2 w-1/4 bg-violet-400/80 rounded"></div>
                  <div className="space-y-1.5 pt-3">
                    <div className="h-1.5 w-full bg-white/[0.1] rounded"></div>
                    <div className="h-1.5 w-full bg-white/[0.1] rounded"></div>
                    <div className="h-1.5 w-5/6 bg-white/[0.1] rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Control Preview Container */}
            <div className="col-span-12 lg:col-span-3 bg-[#121216] border border-white/[0.07] rounded-xl p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Assistant</span>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 flex flex-col justify-between">
                    <div className="h-2.5 w-2.5 bg-violet-500 rounded"></div>
                    <div className="h-1.5 w-12 bg-white/[0.2] rounded"></div>
                  </div>
                  <div className="h-10 bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 flex flex-col justify-between">
                    <div className="h-2.5 w-2.5 bg-blue-500 rounded"></div>
                    <div className="h-1.5 w-14 bg-white/[0.2] rounded"></div>
                  </div>
                  <div className="h-10 bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 flex flex-col justify-between">
                    <div className="h-2.5 w-2.5 bg-emerald-500 rounded"></div>
                    <div className="h-1.5 w-10 bg-white/[0.2] rounded"></div>
                  </div>
                  <div className="h-10 bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 flex flex-col justify-between">
                    <div className="h-2.5 w-2.5 bg-indigo-500 rounded"></div>
                    <div className="h-1.5 w-12 bg-white/[0.2] rounded"></div>
                  </div>
                </div>
              </div>
              <div className="h-20 bg-[#09090c] border border-white/[0.06] rounded-lg mt-4 p-3 flex flex-col justify-between">
                <div className="h-2 w-24 bg-white/[0.15] rounded"></div>
                <div className="h-6 w-full bg-violet-600/20 border border-violet-500/30 rounded flex items-center justify-center text-[9px] font-bold text-violet-300">
                  <Sparkles className="h-2.5 w-2.5 mr-1" /> Reformat Document
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
