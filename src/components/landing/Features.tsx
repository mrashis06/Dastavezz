'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Sparkles, Download, Zap, Shield, Layers } from 'lucide-react';

const FEATURES = [
  {
    icon: <FileText className="h-5 w-5" />,
    label: 'Markdown Editor',
    headline: 'Write without friction',
    description: 'A focused Markdown editor with semantic formatting, toolbar shortcuts, and zero visual clutter. Your words, nothing else.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    large: false,
  },
  {
    icon: <Eye className="h-5 w-5" />,
    label: 'Live Preview',
    headline: 'See exactly what exports',
    description: 'A real-time A4 preview that matches your PDF output pixel-for-pixel. No surprises at export.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    large: false,
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    label: 'Dastavezz AI',
    headline: 'AI that understands your document',
    description: 'Context-aware actions — Improve Style, Rewrite Formal, Summarize, and Suggest Title — all tuned to your document template.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    large: false,
  },
  {
    icon: <Download className="h-5 w-5" />,
    label: 'Export Engine',
    headline: 'PDF, DOCX, Markdown',
    description: 'Export your document in three formats with full fidelity — page size, margins, typography all preserved.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    large: false,
  },
  {
    icon: <Shield className="h-5 w-5" />,
    label: 'Version History',
    headline: 'Never lose a word',
    description: 'Automatic snapshots before every major change. AI checkpoints, template switches, and manual edits — all preserved.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    large: false,
  },
  {
    icon: <Layers className="h-5 w-5" />,
    label: 'Smart Templates',
    headline: 'Start from a professional baseline',
    description: 'Resume, Business Letter, Project Report — templates that set the right formatting context without writing your content for you.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    large: false,
  },
  {
    icon: <Zap className="h-5 w-5" />,
    label: 'Undo / Redo',
    headline: 'Full edit history',
    description: 'Complete undo/redo stack with Ctrl+Z support. AI actions, typing, formatting — everything is reversible.',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    large: true,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 px-6 bg-slate-50 dark:bg-[#0d0d0d]">
      <div className="max-w-[1200px] mx-auto">

        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mb-16"
        >
          <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">Platform</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
            Every tool you need.<br />Nothing you don&apos;t.
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Dastavezz is purpose-built for professional document creation — from writing to AI refinement to export.
          </p>
        </motion.div>

        {/* Bento grid matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200/60 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] rounded-3xl overflow-hidden shadow-sm">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`group relative bg-white dark:bg-[#0a0a0c] p-8 hover:bg-slate-50/30 dark:hover:bg-[#0f0f12] transition-colors duration-300 ${feature.large ? 'sm:col-span-2 lg:col-span-3' : ''}`}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${feature.bg} ${feature.color} mb-5 transition-transform duration-300 group-hover:scale-105`}>
                {feature.icon}
              </div>

              {/* Label */}
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">{feature.label}</p>

              {/* Headline */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">{feature.headline}</h3>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>

              {/* Subtle top light reflection glow on cell hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] dark:from-violet-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
