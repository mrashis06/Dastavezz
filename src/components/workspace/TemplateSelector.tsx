'use client';

import React from 'react';
import { templates } from '../../templates';
import { DocumentTemplate } from '../../types';
import { Briefcase, FileSpreadsheet, Mail, LayoutGrid, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: DocumentTemplate) => void;
  activeTemplateId: string | null;
}

export default function TemplateSelector({ onSelectTemplate, activeTemplateId }: TemplateSelectorProps) {

  const getMeta = (id: string): { icon: React.ReactNode; label: string; accent: string; iconBg: string; activeBg: string; activeBorder: string } => {
    switch (id) {
      case 'resume':
        return {
          icon: <Briefcase className="h-4.5 w-4.5" />,
          label: 'RESUME',
          accent: 'text-violet-600 dark:text-violet-300',
          iconBg: 'bg-violet-50 dark:bg-violet-400/20 text-violet-600 dark:text-violet-300',
          activeBg: 'bg-violet-50/20 dark:bg-violet-950/15',
          activeBorder: 'border-violet-400/60 dark:border-violet-400/40',
        };
      case 'business-letter':
        return {
          icon: <Mail className="h-4.5 w-4.5" />,
          label: 'LETTER',
          accent: 'text-emerald-600 dark:text-emerald-300',
          iconBg: 'bg-emerald-50 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-300',
          activeBg: 'bg-emerald-50/20 dark:bg-emerald-950/15',
          activeBorder: 'border-emerald-400/60 dark:border-emerald-400/40',
        };
      case 'project-report':
        return {
          icon: <FileSpreadsheet className="h-4.5 w-4.5" />,
          label: 'REPORT',
          accent: 'text-amber-600 dark:text-amber-300',
          iconBg: 'bg-amber-50 dark:bg-amber-400/20 text-amber-600 dark:text-amber-300',
          activeBg: 'bg-amber-50/20 dark:bg-amber-950/15',
          activeBorder: 'border-amber-400/60 dark:border-amber-400/40',
        };
      case 'cover-letter':
        return {
          icon: <Mail className="h-4.5 w-4.5" />,
          label: 'COVER',
          accent: 'text-blue-600 dark:text-blue-300',
          iconBg: 'bg-blue-50 dark:bg-blue-400/20 text-blue-600 dark:text-blue-300',
          activeBg: 'bg-blue-50/20 dark:bg-blue-950/15',
          activeBorder: 'border-blue-400/60 dark:border-blue-400/40',
        };
      default:
        return {
          icon: <LayoutGrid className="h-4.5 w-4.5" />,
          label: 'PRESET',
          accent: 'text-slate-600 dark:text-slate-200',
          iconBg: 'bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300',
          activeBg: 'bg-slate-50 dark:bg-white/[0.05]',
          activeBorder: 'border-slate-400 dark:border-white/[0.2]',
        };
    }
  };

  return (
    <section className="w-full bg-white dark:bg-[#0f0f11] border-b border-slate-200 dark:border-white/[0.06] py-5 px-6 select-none shrink-0">
      <div className="mx-auto max-w-[1600px]">

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <LayoutGrid className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
              Template Gallery
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button className="h-7 w-7 rounded-md flex items-center justify-center border border-slate-200 dark:border-white/[0.07] text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] cursor-pointer transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button className="h-7 w-7 rounded-md flex items-center justify-center border border-slate-200 dark:border-white/[0.07] text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] cursor-pointer transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {templates.map((template) => {
            const isActive = activeTemplateId === template.id;
            const meta = getMeta(template.id);

            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={`
                  group relative flex flex-col text-left px-5 py-4 rounded-xl border cursor-pointer
                  transition-all duration-150 w-full min-h-[140px]
                  ${isActive
                    ? `${meta.activeBg} ${meta.activeBorder} shadow-sm dark:shadow-black/40`
                    : 'bg-slate-50/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] hover:bg-white dark:hover:bg-white/[0.05] hover:border-slate-350 dark:hover:border-white/[0.12] hover:shadow-sm dark:hover:shadow-black/20'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-3.5 right-3.5">
                    <CheckCircle2 className={`h-4 w-4 ${meta.accent}`} />
                  </div>
                )}

                {/* Icon */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-3 ${meta.iconBg}`}>
                  {meta.icon}
                </div>

                {/* Name */}
                <p className={`text-xs font-bold leading-snug mb-1 transition-colors ${
                  isActive
                    ? meta.accent
                    : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}>
                  {template.name}
                </p>

                {/* Description */}
                <p className="text-[10.5px] text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium mb-3">
                  {template.description}
                </p>

                {/* Badge */}
                <div className="mt-auto self-start">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border tracking-widest select-none ${
                    isActive
                      ? `${meta.accent} border-current opacity-90`
                      : 'text-slate-400 dark:text-slate-400 border-slate-200 dark:border-white/[0.12]'
                  }`}>
                    {meta.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
