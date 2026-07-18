'use client';

import React from 'react';
import { Eye, FileText, Settings, Compass } from 'lucide-react';
import { ExportSettings } from '../../types';
import { compileMarkdown } from '../../utils/markdown';

interface LivePreviewProps {
  content: string;
  title: string;
  settings: ExportSettings;
}

export default function LivePreview({
  content,
  title,
  settings
}: LivePreviewProps) {
  // Map margins to standard tailwind padding
  const getMarginClass = (margins: ExportSettings['margins']) => {
    switch (margins) {
      case 'narrow':
        return 'p-8 sm:p-10';
      case 'wide':
        return 'p-16 sm:p-20';
      case 'standard':
      default:
        return 'p-12 sm:p-14';
    }
  };

  // Map font settings to css configurations
  const getThemeClass = (theme: ExportSettings['theme']) => {
    switch (theme) {
      case 'minimal':
        return 'doc-theme-minimal font-mono tracking-tight text-gray-800';
      case 'academic':
        return 'doc-theme-academic font-serif leading-relaxed text-gray-900';
      case 'professional':
      default:
        return 'doc-theme-professional font-sans tracking-wide text-gray-850';
    }
  };

  // Map font sizing parameters
  const getFontSizeClass = (fontSize: ExportSettings['fontSize']) => {
    switch (fontSize) {
      case 'sm':
        return 'text-[11px] prose-sm';
      case 'lg':
        return 'text-[15px] prose-lg';
      case 'base':
      default:
        return 'text-[13px] prose-base';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/10 border border-border/60 rounded-xl overflow-hidden">
      {/* Live Preview Panel Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-card/30 px-5 py-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Eye className="h-4.5 w-4.5 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Preview
          </h3>
        </div>
        
        {/* Quick layout status badges */}
        <div className="flex items-center space-x-3 text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center space-x-1">
            <Compass className="h-3 w-3" />
            <span className="capitalize">{settings.theme} Theme</span>
          </div>
          <div className="h-3 w-px bg-border/80" />
          <span className="uppercase text-[10px] bg-secondary/40 px-2 py-0.5 rounded border border-border/20 text-foreground">
            {settings.pageSize}
          </span>
        </div>
      </div>

      {/* A4 Sheet Viewport Wrapper */}
      <div className="flex-1 overflow-y-auto bg-slate-950/60 p-6 flex justify-center items-start">
        <div 
          className={`a4-sheet w-full max-w-[800px] min-h-[900px] rounded-sm shadow-2xl transition-all duration-300 ${getMarginClass(
            settings.margins
          )} ${getThemeClass(settings.theme)} ${getFontSizeClass(settings.fontSize)}`}
        >
          {/* Header watermark in preview */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-6 text-[10px] text-gray-400 tracking-wider uppercase font-mono">
            <span>Dastavezz PDF Preview</span>
            <span>{title ? title : 'Untitled_Document'}</span>
          </div>

          {/* Formatted Content Container */}
          <div className="prose max-w-none break-words">
            {compileMarkdown(content)}
          </div>
        </div>
      </div>
    </div>
  );
}
