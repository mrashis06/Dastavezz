'use client';

import React from 'react';
import { PenLine, Sparkles, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: <PenLine className="h-5 w-5" />,
    label: 'Write',
    title: 'Compose in Markdown',
    description: 'Open the editor and write your document structure — headers, lists, tables, paragraphs — in clean Markdown. No formatting complexity.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    borderColor: 'border-violet-200 dark:border-violet-800/40',
  },
  {
    num: '02',
    icon: <Sparkles className="h-5 w-5" />,
    label: 'Refine',
    title: 'Activate Dastavezz AI',
    description: 'Select an action — Improve Style, Rewrite Formal, Summarize — and let the AI enhance your draft while keeping you in control.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800/40',
  },
  {
    num: '03',
    icon: <CheckCircle2 className="h-5 w-5" />,
    label: 'Export',
    title: 'Export with confidence',
    description: 'Preview the live A4 layout, adjust margins and typography, then export as a pixel-perfect PDF, Word document, or Markdown file.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
  },
];

export default function AIWorkflow() {
  return (
    <section className="py-28 px-6 bg-slate-50 dark:bg-[#0d0d0d]">
      <div className="max-w-[1200px] mx-auto">

        {/* Section header */}
        <div className="max-w-lg mb-16">
          <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
            From blank page to polished document
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            A simple three-step flow designed to eliminate the gap between writing and professional output.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

          {STEPS.map((step, i) => (
            <div
              key={i}
              className="relative group bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-6 hover:border-slate-300 dark:hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/[0.04] transition-all duration-300"
            >
              {/* Step number chip */}
              <div className="flex items-center justify-between mb-5">
                <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${step.bg} ${step.color} transition-transform duration-300 group-hover:scale-105`}>
                  {step.icon}
                </div>
                <span className="text-[11px] font-black font-mono text-slate-200 dark:text-white/10 select-none tracking-wider">{step.num}</span>
              </div>

              {/* Label */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-1.5">{step.label}</p>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">{step.title}</h3>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>

              {/* Left accent border */}
              <div className={`absolute left-0 top-6 bottom-6 w-0.5 rounded-r-full ${step.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
