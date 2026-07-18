'use client';

import React from 'react';
import { FileText, Eye, Sparkles } from 'lucide-react';

export default function WorkspacePreview() {
  return (
    <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-24 select-none">
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        {/* Window Header */}
        <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          {/* Dots */}
          <div className="flex items-center space-x-1.5 select-none">
            <span className="h-3 w-3 rounded-full bg-red-400"></span>
            <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
            <span className="h-3 w-3 rounded-full bg-green-400"></span>
          </div>
          {/* URL Bar */}
          <div className="flex-1 max-w-sm mx-auto bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-855 text-center text-xs py-1 text-slate-400 font-mono">
            dastavezz.app/workspace
          </div>
          <div className="w-12"></div>
        </div>

        {/* Browser Workspace Layout Preview */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 mt-3 grid grid-cols-12 gap-4 text-white pointer-events-none min-h-[460px] select-none shadow-inner">
          {/* Editor Preview Container */}
          <div className="col-span-12 lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-1.5">
                <FileText className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Document Editor</span>
              </div>
              <div className="h-3 w-12 bg-slate-800 rounded"></div>
            </div>
            <div className="space-y-2 flex-1 font-mono text-[10px] text-slate-400 leading-relaxed">
              <div># Professional Resume Outline</div>
              <div>## Summary</div>
              <div>Results-driven software engineer with 5+ years of experience compiling highly-performant, responsive web apps.</div>
              <div>## Tech Stack</div>
              <div>- TypeScript, React, Next.js, CSS</div>
              <div>- Tailwind, Python, Gemini API</div>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-800 pt-2">
              <span>Words: 42</span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50 text-indigo-400">Markdown Active</span>
            </div>
          </div>

          {/* Live Preview Preview Container */}
          <div className="col-span-12 lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2.5 mb-4">
              <div className="flex items-center space-x-1.5">
                <Eye className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Preview</span>
              </div>
              <div className="h-3 w-16 bg-slate-800 rounded"></div>
            </div>
            <div className="w-full bg-white rounded-lg shadow-lg p-5 flex flex-col space-y-4 text-slate-800 min-h-[300px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[8px] font-bold text-slate-400 uppercase font-mono">Dastavezz Preview</span>
                <span className="text-[8px] text-slate-400 font-mono">My_Resume</span>
              </div>
              <div className="space-y-2.5 flex-1">
                <div className="h-3 w-2/3 bg-slate-900 rounded"></div>
                <div className="h-2 w-1/4 bg-slate-400 rounded"></div>
                <div className="space-y-1.5 pt-2">
                  <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                  <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                  <div className="h-1.5 w-5/6 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Control Preview Container */}
          <div className="col-span-12 lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Assistant</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-slate-800 border border-slate-700/50 rounded-lg p-1.5 flex flex-col justify-between">
                  <div className="h-2.5 w-2.5 bg-violet-500 rounded"></div>
                  <div className="h-1.5 w-12 bg-slate-600 rounded"></div>
                </div>
                <div className="h-10 bg-slate-800 border border-slate-700/50 rounded-lg p-1.5 flex flex-col justify-between">
                  <div className="h-2.5 w-2.5 bg-blue-500 rounded"></div>
                  <div className="h-1.5 w-14 bg-slate-600 rounded"></div>
                </div>
                <div className="h-10 bg-slate-800 border border-slate-700/50 rounded-lg p-1.5 flex flex-col justify-between">
                  <div className="h-2.5 w-2.5 bg-emerald-500 rounded"></div>
                  <div className="h-1.5 w-10 bg-slate-600 rounded"></div>
                </div>
                <div className="h-10 bg-slate-800 border border-slate-700/50 rounded-lg p-1.5 flex flex-col justify-between">
                  <div className="h-2.5 w-2.5 bg-indigo-500 rounded"></div>
                  <div className="h-1.5 w-12 bg-slate-600 rounded"></div>
                </div>
              </div>
            </div>
            <div className="h-20 bg-slate-950 border border-slate-800/80 rounded-lg mt-4"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
