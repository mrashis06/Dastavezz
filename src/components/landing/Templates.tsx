'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
    previewLines: [
      '# John Doe',
      'Senior Software Engineer · San Francisco',
      '',
      '## Experience',
      'Senior Architect · Acme Corp (2022-Present)',
      '- Scaled next-gen API platforms with 99.99% availability',
      '- Reduced page load and bundle size by 35%',
      '',
      '## Education',
      'BS in Computer Science · Stanford University'
    ],
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
    previewLines: [
      '**Sender Details**',
      'Acme Corporation · California Division',
      '',
      'Date: July 20, 2026',
      '',
      'Dear Partner,',
      '',
      'We are writing to formalize the agreement between Dastavezz and Acme Corp...',
      '',
      'Sincerely,',
      'The Executive Board'
    ],
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
    previewLines: [
      '# Q3 Project Milestones',
      '## Platform Architecture Upgrade',
      '',
      '| Status | Milestone | Target Date |',
      '|---|---|---|',
      '| ✅ | Database Cluster Sync | Aug 15 |',
      '| 🚀 | Mobile PWA Sync Offline | Sep 30 |',
      '',
      '## Key Takeaways',
      '1. High operational performance on small mobile devices.',
      '2. Improved scalability metrics by 40%.'
    ],
  },
];

export default function Templates() {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const activeTemplate = TEMPLATES[activeIdx];

  return (
    <section id="templates" className="py-28 px-6 bg-slate-50/70 dark:bg-[#08080a] border-y border-slate-200/60 dark:border-white/[0.03] relative overflow-hidden">
      {/* Premium background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-500/10 dark:from-violet-500/15 via-transparent to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">

        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6"
        >
          <div className="max-w-md">
            <p className="text-[11px] font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">Templates</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              Start with the right format
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Templates configure document type, layout, and AI context — they never fill in your content.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 dark:text-slate-650 select-none">
            <FileText className="h-3.5 w-3.5" />
            <span>3 professional presets</span>
          </div>
        </motion.div>

        {/* Interactive Split-Pane Templates Showroom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Interactive Selector Tabs */}
          <div className="lg:col-span-5 flex flex-col space-y-3.5 justify-center">
            {TEMPLATES.map((t, idx) => {
              const isActive = activeIdx === idx;
              return (
                <button
                  key={t.id}
                  type="button"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full flex items-start space-x-4 p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer select-none ${
                    isActive
                      ? 'bg-white dark:bg-white/[0.03] border-violet-500/40 dark:border-violet-500/40 shadow-md shadow-violet-500/5'
                      : 'bg-transparent border-transparent hover:bg-slate-100/40 dark:hover:bg-white/[0.01]'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${t.bg} ${t.color}`}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                        {t.title}
                      </span>
                      {isActive && (
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded border ${t.badgeColor} select-none`}>
                          {t.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-violet-500 dark:text-violet-400 mt-1">{t.tagline}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Browser Editor Preview Mockup */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center">
            <div className="flex-1 min-h-[380px] bg-white dark:bg-[#0c0c0f] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl shadow-xl overflow-hidden flex flex-col relative group">
              {/* Browser mockup header bar */}
              <div className="h-9 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01] flex items-center px-4 justify-between shrink-0 select-none">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="text-[10px] font-mono text-slate-450 dark:text-slate-600 bg-slate-100 dark:bg-white/[0.03] px-6 py-0.5 rounded border border-slate-200/40 dark:border-white/[0.04] leading-none shrink-0 truncate max-w-[180px]">
                  dastavezz.online/preview/{activeTemplate.id}
                </div>
                <div className="w-12" />
              </div>

              {/* Dynamic Live Markdown A4 Sheet Output */}
              <div className="flex-1 p-6 font-mono text-[10px] leading-relaxed text-slate-450 dark:text-slate-650 overflow-y-auto no-scrollbar max-h-[340px]">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2.5"
                >
                  {activeTemplate.previewLines?.map((line, i) => {
                    const isHeader1 = line.startsWith('# ');
                    const isHeader2 = line.startsWith('## ');
                    const isSpacer = line === '';
                    
                    let renderedText = line;
                    let lineClass = "text-slate-500 dark:text-slate-500";
                    
                    if (isHeader1) {
                      renderedText = line.substring(2);
                      lineClass = "text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/[0.04] pb-1 block mt-1";
                    } else if (isHeader2) {
                      renderedText = line.substring(3);
                      lineClass = "text-xs font-bold text-slate-800 dark:text-slate-250 block mt-2";
                    } else if (isSpacer) {
                      renderedText = "\u00A0";
                      lineClass = "h-1";
                    } else if (line.startsWith('|')) {
                      lineClass = "text-indigo-650 dark:text-indigo-400/90 font-mono tracking-tight";
                    } else if (line.startsWith('-') || line.match(/^\d\./)) {
                      lineClass = "text-slate-600 dark:text-slate-450 pl-2";
                    }

                    return (
                      <div key={i} className={`${lineClass} truncate`}>
                        {renderedText}
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Action overlay on mouse hover */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white dark:from-[#0c0c0f] via-white/80 dark:via-[#0c0c0f]/80 to-transparent flex items-center justify-center pointer-events-none select-none">
                <div className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold rounded-lg shadow-lg flex items-center space-x-1.5 pointer-events-auto hover:scale-105 active:scale-95 transition cursor-pointer">
                  <span>Use {activeTemplate.title}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
