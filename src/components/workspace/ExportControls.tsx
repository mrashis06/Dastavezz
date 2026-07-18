'use client';

import React, { useState } from 'react';
import { Settings, FileText, Download, Check, HelpCircle } from 'lucide-react';
import { ExportSettings } from '../../types';

interface ExportControlsProps {
  settings: ExportSettings;
  onSettingsChange: (newSettings: ExportSettings) => void;
  documentTitle: string;
  documentContent: string;
}

export default function ExportControls({
  settings,
  onSettingsChange,
  documentTitle,
  documentContent
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [successExport, setSuccessExport] = useState<string | null>(null);

  const updateSetting = <K extends keyof ExportSettings>(key: K, value: ExportSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  // Triggers browser download of text/markdown document content
  const handleExport = async (format: 'pdf' | 'docx' | 'markdown') => {
    setIsExporting(format);
    setSuccessExport(null);
    
    // Simulate compilation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const fileName = (documentTitle || 'Untitled_Document').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      if (format === 'markdown') {
        const blob = new Blob([documentContent], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'pdf') {
        // Simulate PDF download by bundling custom HTML styled preview
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${documentTitle}</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              pre { background: #f4f4f4; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; }
              hr { border: 0; border-top: 1px solid #ddd; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>${documentTitle}</h1>
            <hr />
            <pre>${documentContent}</pre>
          </body>
          </html>
        `;
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}_formatted.html`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Simulate DOCX by downloading text representation
        const blob = new Blob([documentContent], { type: 'application/msword;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}.docx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setSuccessExport(format);
      setTimeout(() => setSuccessExport(null), 3000);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-col bg-card/20 border border-border/60 rounded-xl overflow-hidden h-full">
      {/* Exporter Header */}
      <div className="flex items-center space-x-2 border-b border-border/60 bg-card/30 px-5 py-3 shrink-0">
        <Settings className="h-4.5 w-4.5 text-indigo-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Layout & Export
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Layout Adjustments */}
        <div className="space-y-4">
          {/* Document Font Theme Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Typography Style
            </label>
            <div className="grid grid-cols-3 gap-1 bg-secondary/30 rounded-lg p-0.5 border border-border/40">
              {(['professional', 'minimal', 'academic'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateSetting('theme', style)}
                  className={`text-[10px] font-medium py-1.5 rounded-md capitalize transition cursor-pointer ${
                    settings.theme === style
                      ? 'bg-violet-600 text-white font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Margins Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Page Margins
            </label>
            <div className="grid grid-cols-3 gap-1 bg-secondary/30 rounded-lg p-0.5 border border-border/40">
              {(['narrow', 'standard', 'wide'] as const).map((margin) => (
                <button
                  key={margin}
                  onClick={() => updateSetting('margins', margin)}
                  className={`text-[10px] font-medium py-1.5 rounded-md capitalize transition cursor-pointer ${
                    settings.margins === margin
                      ? 'bg-violet-600 text-white font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {margin}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Settings */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Text Font Size
            </label>
            <div className="grid grid-cols-3 gap-1 bg-secondary/30 rounded-lg p-0.5 border border-border/40">
              {(['sm', 'base', 'lg'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`text-[10px] font-medium py-1.5 rounded-md uppercase transition cursor-pointer ${
                    settings.fontSize === size
                      ? 'bg-violet-600 text-white font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-border/40 my-2" />

        {/* Exporter triggers */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Export Settings
          </label>
          
          <div className="space-y-2">
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting !== null || !documentContent}
              className="flex items-center justify-between w-full text-xs font-medium text-foreground bg-secondary/40 hover:bg-secondary/70 border border-border/60 rounded-lg px-4 py-2.5 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="h-4 w-4 text-red-400" />
                <span>Export Styled PDF</span>
              </div>
              {isExporting === 'pdf' ? (
                <span className="text-[10px] text-indigo-400 animate-pulse">Compiling...</span>
              ) : successExport === 'pdf' ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            <button
              onClick={() => handleExport('docx')}
              disabled={isExporting !== null || !documentContent}
              className="flex items-center justify-between w-full text-xs font-medium text-foreground bg-secondary/40 hover:bg-secondary/70 border border-border/60 rounded-lg px-4 py-2.5 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="h-4 w-4 text-blue-400" />
                <span>Export Word Document</span>
              </div>
              {isExporting === 'docx' ? (
                <span className="text-[10px] text-indigo-400 animate-pulse">Compiling...</span>
              ) : successExport === 'docx' ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            <button
              onClick={() => handleExport('markdown')}
              disabled={isExporting !== null || !documentContent}
              className="flex items-center justify-between w-full text-xs font-medium text-foreground bg-secondary/40 hover:bg-secondary/70 border border-border/60 rounded-lg px-4 py-2.5 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Export Raw Markdown</span>
              </div>
              {isExporting === 'markdown' ? (
                <span className="text-[10px] text-indigo-400 animate-pulse">Downloading...</span>
              ) : successExport === 'markdown' ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
