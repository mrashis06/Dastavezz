'use client';

import React from 'react';
import { SmartTemplatesRegistry, SmartTemplateConfig } from '@/templates';
import { Briefcase, FileSpreadsheet, Mail, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface TemplatePickerProps {
  activeTemplateId: string | null;
  onSelectTemplate: (config: SmartTemplateConfig) => void;
}

export default function TemplatePicker({
  activeTemplateId,
  onSelectTemplate,
}: TemplatePickerProps) {
  const getMeta = (id: string) => {
    switch (id) {
      case 'resume':
        return {
          icon: <Briefcase className="h-4 w-4" />,
          label: 'RESUME',
          accent: 'text-violet-600 dark:text-violet-300',
          iconBg: 'bg-violet-50 dark:bg-violet-400/20 text-violet-600 dark:text-violet-300',
          activeBg: 'bg-violet-50/20 dark:bg-violet-950/15',
          activeBorder: 'border-violet-400/60 dark:border-violet-400/40',
        };
      case 'business-letter':
        return {
          icon: <Mail className="h-4 w-4" />,
          label: 'LETTER',
          accent: 'text-emerald-600 dark:text-emerald-300',
          iconBg: 'bg-emerald-50 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-300',
          activeBg: 'bg-emerald-50/20 dark:bg-emerald-950/15',
          activeBorder: 'border-emerald-400/60 dark:border-emerald-400/40',
        };
      case 'project-report':
        return {
          icon: <FileSpreadsheet className="h-4 w-4" />,
          label: 'REPORT',
          accent: 'text-amber-600 dark:text-amber-300',
          iconBg: 'bg-amber-50 dark:bg-amber-400/20 text-amber-600 dark:text-amber-300',
          activeBg: 'bg-amber-50/20 dark:bg-amber-950/15',
          activeBorder: 'border-amber-400/60 dark:border-amber-400/40',
        };
      default:
        return {
          icon: <LayoutGrid className="h-4 w-4" />,
          label: 'PRESET',
          accent: 'text-slate-600 dark:text-slate-200',
          iconBg: 'bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300',
          activeBg: 'bg-slate-50 dark:bg-white/[0.05]',
          activeBorder: 'border-slate-400 dark:border-white/[0.2]',
        };
    }
  };

  return (
    <section className="w-full bg-white dark:bg-[#0f0f11] border-b border-slate-200 dark:border-white/[0.06] py-1.5 sm:py-4 px-3 sm:px-6 select-none shrink-0">
      <div className="mx-auto max-w-[1600px]">
        {/* Header row (Hidden on Mobile) */}
        <div className="hidden md:flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 dark:text-slate-500" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
              Smart Template Engine
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
            Select a template to format your document using AI
          </span>
        </div>

        {/* ── MOBILE HORIZONTAL COMPACT CARDS ─────────────────────────────── */}
        <div className="flex md:hidden items-center space-x-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {SmartTemplatesRegistry.templates.map((template) => {
            const isActive = activeTemplateId === template.id;
            const meta = getMeta(template.id);

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelectTemplate(template)}
                className={`
                  flex items-center space-x-2.5 px-3 py-2 rounded-xl border text-left cursor-pointer shrink-0 transition-all duration-150 min-w-[170px]
                  ${
                    isActive
                      ? `${meta.activeBg} ${meta.activeBorder} shadow-sm border-violet-500/50`
                      : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06]'
                  }
                `}
              >
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                  {meta.icon}
                </div>
                <div className="flex flex-col min-w-0 pr-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold truncate text-slate-900 dark:text-white leading-tight">
                      {template.name}
                    </span>
                    {isActive && <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${meta.accent}`} />}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    {meta.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── DESKTOP GRID CARDS (3 COLUMNS) ─────────────────────────────── */}
        <div className="hidden md:grid md:grid-cols-3 gap-3.5">
          {SmartTemplatesRegistry.templates.map((template) => {
            const isActive = activeTemplateId === template.id;
            const meta = getMeta(template.id);

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelectTemplate(template)}
                className={`
                  group relative flex items-center text-left px-3.5 py-2.5 rounded-xl border cursor-pointer
                  transition-all duration-150 w-full min-h-[58px]
                  ${
                    isActive
                      ? `${meta.activeBg} ${meta.activeBorder} shadow-sm dark:shadow-black/40`
                      : 'bg-slate-50/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] hover:bg-white dark:hover:bg-white/[0.05] hover:border-slate-350 dark:hover:border-white/[0.12] hover:shadow-sm dark:hover:shadow-black/20'
                  }
                `}
              >
                {/* Icon */}
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mr-3 ${meta.iconBg}`}>
                  {meta.icon}
                </div>

                {/* Details (Inline Header + Description) */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold leading-none transition-colors ${
                        isActive
                          ? meta.accent
                          : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    >
                      {template.name}
                    </span>
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.2 rounded border tracking-widest uppercase select-none shrink-0 ${
                        isActive
                          ? `${meta.accent} border-current opacity-90`
                          : 'text-slate-400 dark:text-slate-400 border-slate-200 dark:border-white/[0.12]'
                      }`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1 font-normal">
                    {template.description}
                  </p>
                </div>

                {/* Active checkmark */}
                {isActive && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0">
                    <CheckCircle2 className={`h-4 w-4 ${meta.accent}`} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
