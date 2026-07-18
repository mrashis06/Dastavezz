'use client';

import React from 'react';
import { Briefcase, Mail, FileSpreadsheet, ArrowRight, FileText } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'resume',
    icon: <Briefcase className="h-4 w-4" />,
    label: 'Resume',
    title: 'Professional Resume',
    tagline: 'ATS-optimized formatting',
    description: 'Clean, structured layout for technical skills, experience, and achievements. Tuned for recruiter readability.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    badgeColor: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40',
    previewLines: ['# Your Name', '**Senior Engineer · City**', '', '## Experience', '**Company Inc.** · 2021–Present', '- Led architecture for...', '- Improved performance by...', '', '## Skills', 'TypeScript · React · Node.js'],
  },
  {
    id: 'letter',
    icon: <Mail className="h-4 w-4" />,
    label: 'Business Letter',
    title: 'Formal Business Letter',
    tagline: 'Executive-grade format',
    description: 'Professional structure for executive communications, cover letters, and formal agreements.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
    previewLines: ['**[Your Name]**', '[Date]', '', '**Re: Subject**', '', 'Dear [Recipient],', '', 'I am writing to express...', '', 'Sincerely,', '[Signature]'],
  },
  {
    id: 'report',
    icon: <FileSpreadsheet className="h-4 w-4" />,
    label: 'Project Report',
    title: 'Project Outline Report',
    tagline: 'Rich table & section support',
    description: 'Comprehensive structure with headers, tables, lists, and content blocks for technical reporting.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    previewLines: ['# Project Report', '## Executive Summary', '', '| Metric | Value |', '|--------|-------|', '| Status | Active |', '', '## Key Deliverables', '1. Phase 1 complete', '2. Testing underway'],
  },
];

export default function Templates() {
  return (
    <section id="templates" className="py-28 px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <div className="max-w-md">
            <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">Templates</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              Start with the right format
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Templates configure document type, layout, and AI context — they never fill in your content.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 dark:text-slate-600 select-none">
            <FileText className="h-3.5 w-3.5" />
            <span>3 professional templates</span>
          </div>
        </div>

        {/* Template cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="group relative bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/[0.06] transition-all duration-300 flex flex-col"
            >
              {/* Document preview pane */}
              <div className="relative bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.06] px-5 pt-5 pb-4 overflow-hidden" style={{ minHeight: 180 }}>
                {/* Fake document lines */}
                <div className="space-y-1.5 font-mono text-[9px] leading-relaxed text-slate-400 dark:text-slate-600 select-none">
                  {t.previewLines.map((line, i) => (
                    <div key={i} className={`${line.startsWith('#') ? 'font-bold text-slate-600 dark:text-slate-400 text-[10px]' : ''} ${line.startsWith('**') ? 'font-semibold text-slate-500 dark:text-slate-500' : ''} ${line === '' ? 'h-1.5' : ''} truncate`}>
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
                {/* Fade overlay */}
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-50 dark:from-[#0d0d0d] to-transparent" />
              </div>

              {/* Card content */}
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.bg} ${t.color} transition-transform duration-300 group-hover:scale-105`}>
                    {t.icon}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${t.badgeColor} select-none`}>
                    {t.label}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{t.title}</h3>
                <p className="text-[11px] font-semibold text-violet-500 dark:text-violet-400 mb-2">{t.tagline}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.description}</p>
              </div>

              {/* Footer action */}
              <div className="px-5 pb-4">
                <button className="flex items-center text-[11px] font-semibold text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-200 cursor-pointer">
                  Use template
                  <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
