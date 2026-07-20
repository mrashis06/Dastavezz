'use client';

import React, { useState } from 'react';
import {
  Settings2,
  FileText,
  Download,
  Check,
  Loader2,
  AlignCenter,
  AlignLeft,
  LayoutPanelLeft,
  ZoomIn
} from 'lucide-react';
import { ExportSettings } from '../../types';
import { compileMarkdown, compileMarkdownToHtml } from '../../utils/markdown';
import { exportToPDF } from '../../utils/pdfExport';

interface ExportControlsProps {
  settings: ExportSettings;
  onSettingsChange: (newSettings: ExportSettings) => void;
  documentTitle: string;
  documentContent: string;
}

const getThemeClass = (theme: ExportSettings['theme']) => {
  switch (theme) {
    case 'minimal': return 'doc-theme-minimal font-mono tracking-tight text-gray-800';
    case 'academic': return 'doc-theme-academic font-serif leading-relaxed text-gray-900';
    case 'professional':
    default: return 'doc-theme-professional font-sans tracking-wide text-gray-850';
  }
};

const getFontSizeClass = (fontSize: ExportSettings['fontSize']) => {
  switch (fontSize) {
    case 'sm': return 'text-[11px] prose-sm';
    case 'lg': return 'text-[15px] prose-lg';
    case 'base':
    default: return 'text-[13px] prose-base';
  }
};

const getPaperDimensions = (pageSize: ExportSettings['pageSize'], orientation: ExportSettings['orientation']) => {
  let width = 794; // A4
  let height = 1123;
  switch (pageSize) {
    case 'Letter': width = 816; height = 1056; break;
    case 'Legal': width = 816; height = 1344; break;
    case 'A3': width = 1123; height = 1587; break;
    case 'A5': width = 559; height = 794; break;
    case 'B5': width = 665; height = 941; break;
    case 'A4':
    default: width = 794; height = 1123; break;
  }
  if (orientation === 'landscape') {
    return { width: `${height}px`, minHeight: `${width}px` };
  }
  return { width: `${width}px`, minHeight: `${height}px` };
};

// Helper: thin labeled section divider
function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center space-x-2 mb-3">
      <div className="text-muted-foreground/70">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none">{label}</span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
    </div>
  );
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
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'markdown') => {
    setIsExporting(format);
    setSuccessExport(null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
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
        await exportToPDF('pdf-export-content', documentTitle, settings);
      } else {
        const compiledHtml = compileMarkdownToHtml(documentContent);

        const fontName = settings.theme === 'minimal' ? 'Courier New' : settings.theme === 'academic' ? 'Georgia' : 'Arial';
        const fontSizePt = settings.fontSize === 'sm' ? '10.5pt' : settings.fontSize === 'lg' ? '13.5pt' : '11.5pt';

        const docHtml = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <title>${documentTitle}</title>
            <!--[if gte mso 9]>
            <xml>
              <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>100</w:Zoom>
                <w:DoNotOptimizeForBrowser/>
              </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
              body {
                font-family: '${fontName}', 'Segoe UI', Arial, sans-serif;
                font-size: ${fontSizePt};
                line-height: 1.5;
                color: #2b2d31;
                margin: 1in;
              }
              h1 {
                font-size: 24pt;
                font-weight: bold;
                color: #111827;
                margin-top: 18pt;
                margin-bottom: 8pt;
              }
              h2 {
                font-size: 16pt;
                font-weight: bold;
                color: #1f2937;
                margin-top: 14pt;
                margin-bottom: 6pt;
                border-bottom: 1.5px solid #e5e7eb;
                padding-bottom: 3pt;
              }
              h3 {
                font-size: 13pt;
                font-weight: bold;
                color: #374151;
                margin-top: 12pt;
                margin-bottom: 4pt;
              }
              p {
                margin-top: 0;
                margin-bottom: 8pt;
              }
              ul, ol {
                margin-top: 0;
                margin-bottom: 8pt;
                padding-left: 20pt;
              }
              li {
                margin-bottom: 3pt;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 14pt;
              }
              th, td {
                border: 1px solid #d1d5db;
                padding: 8px 10px;
                text-align: left;
                font-size: 10pt;
              }
              th {
                background-color: #f9fafb;
                font-weight: bold;
                color: #111827;
              }
              a {
                color: #4f46e5;
                text-decoration: underline;
              }
              hr {
                border: 0;
                border-top: 1px solid #e5e7eb;
                margin: 16pt 0;
              }
            </style>
          </head>
          <body>
            ${compiledHtml}
          </body>
          </html>
        `;

        const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}.doc`);
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

  const customMargins = settings.customMargins || { top: 20, right: 20, bottom: 20, left: 20 };

  const EXPORT_OPTIONS: { format: 'pdf' | 'docx' | 'markdown'; label: string; description: string; ext: string; color: string; iconColor: string }[] = [
    { format: 'pdf', label: 'Export as PDF', description: 'Styled, print-ready document', ext: '.pdf', color: 'border-red-100 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30', iconColor: 'text-red-500' },
    { format: 'docx', label: 'Export as Word', description: 'Microsoft Word compatible', ext: '.docx', color: 'border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30', iconColor: 'text-blue-500' },
    { format: 'markdown', label: 'Export as Markdown', description: 'Raw .md source file', ext: '.md', color: 'border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/30', iconColor: 'text-indigo-500' },
  ];

  return (
    <>
      <div className="flex flex-col bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/[0.07] rounded-2xl overflow-hidden h-full shadow-sm dark:shadow-black/30">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100 shadow-sm">
              <Settings2 className="h-3.5 w-3.5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight leading-none">Layout & Export</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Page format & document export</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-7">
          {/* ── Paper ── */}
          <div>
            <SectionHeading icon={<LayoutPanelLeft className="h-3.5 w-3.5" />} label="Paper" />
            <div className="space-y-3">
              {/* Page Size */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground mb-1.5 block">Paper Size</label>
                <select
                  value={settings.pageSize}
                  onChange={(e) => updateSetting('pageSize', e.target.value as ExportSettings['pageSize'])}
                  className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.07] text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer transition"
                >
                  <option value="A4" className="bg-white dark:bg-[#1a1a20] text-slate-900 dark:text-slate-100">A4 — 210 × 297 mm</option>
                  <option value="Letter" className="bg-white dark:bg-[#1a1a20] text-slate-900 dark:text-slate-100">Letter — 8.5 × 11 in</option>
                  <option value="Legal" className="bg-white dark:bg-[#1a1a20] text-slate-900 dark:text-slate-100">Legal — 8.5 × 14 in</option>
                  <option value="A3" className="bg-white dark:bg-[#1a1a20] text-slate-900 dark:text-slate-100">A3 — 297 × 420 mm</option>
                  <option value="A5" className="bg-white dark:bg-[#1a1a20] text-slate-900 dark:text-slate-100">A5 — 148 × 210 mm</option>
                  <option value="B5" className="bg-white dark:bg-[#1a1a20] text-slate-900 dark:text-slate-100">B5 — 176 × 250 mm</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground mb-1.5 block">Orientation</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['portrait', 'landscape'] as const).map((orient) => (
                    <button
                      key={orient}
                      onClick={() => updateSetting('orientation', orient)}
                      className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${settings.orientation === orient
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm'
                          : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.07] text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07]'
                        }`}
                    >
                      {orient === 'portrait' ? (
                        <AlignCenter className="h-3.5 w-3.5" />
                      ) : (
                        <AlignLeft className="h-3.5 w-3.5 rotate-90" />
                      )}
                      <span className="capitalize">{orient}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Margins ── */}
          <div>
            <SectionHeading icon={<ZoomIn className="h-3.5 w-3.5" />} label="Margins" />
            <div className="space-y-3">
              {/* Preset margin buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                {(['standard', 'narrow', 'wide'] as const).map((margin) => (
                  <button
                    key={margin}
                    onClick={() => updateSetting('margins', margin)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize transition cursor-pointer border ${settings.margins === margin
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm'
                        : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.07] text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07]'
                      }`}
                  >
                    {margin === 'standard' ? 'Normal' : margin}
                  </button>
                ))}
              </div>

              {/* Custom margin inputs */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground mb-2 block">Custom (mm)</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['top', 'right', 'bottom', 'left'] as const).map((dir) => (
                    <div key={dir} className="flex flex-col items-center space-y-1">
                      <span className="text-[9px] text-muted-foreground capitalize font-bold select-none">{dir}</span>
                      <input
                        type="number"
                        value={customMargins[dir]}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          onSettingsChange({
                            ...settings,
                            margins: 'custom',
                            customMargins: { ...customMargins, [dir]: val }
                          });
                        }}
                        className="w-full bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.07] text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg px-1 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-center transition"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const topVal = customMargins.top;
                    onSettingsChange({
                      ...settings,
                      margins: 'custom',
                      customMargins: { top: topVal, right: topVal, bottom: topVal, left: topVal }
                    });
                  }}
                  className="w-full mt-2 py-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-lg transition cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.07]"
                >
                  Apply all sides equally
                </button>
              </div>
            </div>
          </div>

          {/* ── Typography ── */}
          <div>
            <SectionHeading icon={<FileText className="h-3.5 w-3.5" />} label="Typography" />
            <div className="space-y-3">
              {/* Theme */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground mb-1.5 block">Type Theme</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'professional', label: 'Pro', detail: 'Sans-serif' },
                    { id: 'minimal', label: 'Mono', detail: 'Monospace' },
                    { id: 'academic', label: 'Academic', detail: 'Serif' }
                  ] as const).map(({ id, label, detail }) => (
                    <button
                      key={id}
                      onClick={() => updateSetting('theme', id)}
                      className={`flex flex-col items-center py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${settings.theme === id
                          ? 'bg-slate-900 dark:bg-violet-600 text-white dark:text-white border-slate-900 dark:border-violet-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07]'
                        }`}
                    >
                      <span>{label}</span>
                      <span className={`text-[8px] font-normal mt-0.5 ${settings.theme === id ? 'opacity-70' : 'text-muted-foreground/60'}`}>{detail}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground mb-1.5 block">Text Size</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'sm', label: 'Small', detail: '11px' },
                    { id: 'base', label: 'Base', detail: '13px' },
                    { id: 'lg', label: 'Large', detail: '15px' }
                  ] as const).map(({ id, label, detail }) => (
                    <button
                      key={id}
                      onClick={() => updateSetting('fontSize', id)}
                      className={`flex flex-col items-center py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${settings.fontSize === id
                          ? 'bg-slate-900 dark:bg-violet-600 text-white dark:text-white border-slate-900 dark:border-violet-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07]'
                        }`}
                    >
                      <span>{label}</span>
                      <span className={`text-[8px] font-normal mt-0.5 ${settings.fontSize === id ? 'opacity-70' : 'text-muted-foreground/60'}`}>{detail}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Export ── */}
          <div>
            <SectionHeading icon={<Download className="h-3.5 w-3.5" />} label="Export" />
            <div className="space-y-2">
              {EXPORT_OPTIONS.map(({ format, label, description, ext, color, iconColor }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={isExporting !== null || !documentContent}
                  className={`group flex items-center justify-between w-full p-4 rounded-xl border text-left transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className={`h-5 w-5 ${iconColor} shrink-0`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{description} &middot; <span className="font-mono">{ext}</span></p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-3">
                    {isExporting === format ? (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    ) : successExport === format ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Download className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground transition" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
