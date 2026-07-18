'use client';

import React from 'react';
import { templates } from '../../templates';
import { DocumentTemplate } from '../../types';
import { Briefcase, FileSpreadsheet, Mail, LayoutGrid } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (template: DocumentTemplate) => void;
  activeTemplateId: string | null;
}

export default function TemplateSelector({
  onSelectTemplate,
  activeTemplateId
}: TemplateSelectorProps) {
  // Utility to match icons to template IDs
  const getIcon = (id: string) => {
    switch (id) {
      case 'resume':
        return <Briefcase className="h-5 w-5 text-violet-400" />;
      case 'business-letter':
        return <Mail className="h-5 w-5 text-blue-400" />;
      case 'project-report':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-400" />;
      default:
        return <LayoutGrid className="h-5 w-5 text-indigo-400" />;
    }
  };

  return (
    <section className="w-full bg-secondary/10 border-b border-border/40 py-5 px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="h-4.5 w-4.5 text-indigo-400" />
            <h2 className="text-sm font-semibold tracking-wide uppercase text-indigo-300">
              Template Gallery
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Select a document preset to populate the workspace
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {templates.map((template) => {
            const isActive = activeTemplateId === template.id;
            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={`flex items-start text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-violet-950/20 border-violet-500/80 shadow-md shadow-violet-500/5'
                    : 'bg-card/40 border-border/50 hover:bg-card/70 hover:border-border/100'
                }`}
              >
                <div className={`p-2.5 rounded-lg mr-4 ${
                  isActive ? 'bg-violet-500/20' : 'bg-secondary/40'
                }`}>
                  {getIcon(template.id)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
