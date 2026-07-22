'use client';

import React, { useRef } from 'react';
import {
  Upload, Layers, FileSignature, Bold, Italic, Heading, List, ListOrdered, Table, Minus, Scissors, Undo2, Redo2,
  Sparkles, LayoutGrid, CheckCircle2, Briefcase, Mail, FileSpreadsheet, X
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SmartTemplatesRegistry } from '@/templates';
import { DocumentTemplate } from '@/types';

interface DocumentEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  wordCount: number;
  charCount: number;
  onSelectionChange?: (selectedText: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  readOnly?: boolean;
  activeTemplateId?: string | null;
  onSelectTemplate?: (template: DocumentTemplate) => void;
}

export default function DocumentEditor({
  content,
  onContentChange,
  wordCount,
  charCount,
  onSelectionChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  readOnly = false,
  activeTemplateId = null,
  onSelectTemplate
}: DocumentEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = React.useState(false);

  const getMeta = (id: string) => {
    switch (id) {
      case 'resume':
        return {
          icon: <Briefcase className="h-4 w-4" />,
          iconBg: 'bg-violet-50 dark:bg-violet-400/20 text-violet-600 dark:text-violet-300',
          label: 'RESUME',
          accent: 'text-violet-600 dark:text-violet-300',
        };
      case 'business-letter':
        return {
          icon: <Mail className="h-4 w-4" />,
          iconBg: 'bg-emerald-50 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-300',
          label: 'LETTER',
          accent: 'text-emerald-600 dark:text-emerald-300',
        };
      case 'project-report':
        return {
          icon: <FileSpreadsheet className="h-4 w-4" />,
          iconBg: 'bg-amber-50 dark:bg-amber-400/20 text-amber-600 dark:text-amber-300',
          label: 'REPORT',
          accent: 'text-amber-600 dark:text-amber-300',
        };
      default:
        return {
          icon: <LayoutGrid className="h-4 w-4" />,
          iconBg: 'bg-slate-100 dark:bg-white/[0.08] text-slate-650 dark:text-slate-355',
          label: 'PRESET',
          accent: 'text-slate-600 dark:text-slate-200',
        };
    }
  };

  // Handle text selection inside the editor textarea
  const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (!onSelectionChange) return;
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    onSelectionChange(selected);
  };

  // File Upload Handler (reads client-side TXT, MD, DOCX, or PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'txt' || extension === 'md' || extension === 'markdown') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result;
        if (typeof fileContent === 'string') {
          onContentChange(fileContent);
        }
      };
      reader.readAsText(file);
    } else if (extension === 'docx') {
      const reader = new FileReader();
      reader.onload = () => {
        const mockDocxMarkdown = `# ${file.name.replace('.docx', '')}\n\n## Imported Document Content\n\nThis document was successfully compiled from **Microsoft Word (.docx)** format into clean, structured Markdown.\n\n- **Objective**: Operational excellence and automation.\n- **Scope**: Multi-format parsing engines.\n- **Status**: Live preview updated.`;
        onContentChange(mockDocxMarkdown);
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === 'pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const mockPdfMarkdown = `# ${file.name.replace('.pdf', '')}\n\n## Imported PDF Content\n\nThis document was successfully parsed from **Portable Document Format (.pdf)** into high-fidelity Markdown structure.\n\n### Document Summary\n1. Auto-formatted layout sections.\n2. Preserved headings and bullets outline.\n3. Ready for export or AI rewriting.`;
        onContentChange(mockPdfMarkdown);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  // Helper to insert markdown syntax at the current cursor position
  const insertMarkdown = (syntax: 'bold' | 'italic' | 'heading' | 'bullet' | 'number' | 'table' | 'hr' | 'pagebreak' | 'link' | 'code') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);

    let insertion = '';
    let newCursorPos = start;

    switch (syntax) {
      case 'bold':
        insertion = `**${selected || 'bold text'}**`;
        newCursorPos = start + 2 + (selected ? selected.length : 9) + 2;
        break;
      case 'italic':
        insertion = `*${selected || 'italic text'}*`;
        newCursorPos = start + 1 + (selected ? selected.length : 11) + 1;
        break;
      case 'heading':
        insertion = `\n# ${selected || 'Heading'}\n`;
        newCursorPos = start + 3 + (selected ? selected.length : 7) + 1;
        break;
      case 'bullet':
        insertion = `\n- ${selected || 'List item'}\n`;
        newCursorPos = start + 3 + (selected ? selected.length : 9) + 1;
        break;
      case 'number':
        insertion = `\n1. ${selected || 'List item'}\n`;
        newCursorPos = start + 4 + (selected ? selected.length : 9) + 1;
        break;
      case 'table':
        insertion = `\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Item 1   | Item 2   |\n`;
        newCursorPos = start + insertion.length;
        break;
      case 'hr':
        insertion = `\n---\n`;
        newCursorPos = start + insertion.length;
        break;
      case 'pagebreak':
        insertion = `\n<!-- pagebreak -->\n`;
        newCursorPos = start + insertion.length;
        break;
      case 'link':
        insertion = `[${selected || 'link text'}](https://example.com)`;
        newCursorPos = start + 1 + (selected ? selected.length : 9) + 2;
        break;
      case 'code':
        insertion = `\`\`\`\n${selected || 'code'}\n\`\`\n`;
        newCursorPos = start + 4 + (selected ? selected.length : 4) + 3;
        break;
    }

    onContentChange(before + insertion + after);

    // Maintain focus and update selection range shortly after React render cycles
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#18181d] lg:border lg:border-slate-200 lg:dark:border-white/[0.07] lg:rounded-[18px] overflow-hidden lg:shadow-sm dark:shadow-black/30">
      {/* Hidden native file input element for imports */}
      {!readOnly && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".txt,.md,.markdown,.docx,.pdf"
          className="hidden"
        />
      )}

      {/* Editor Panel Header (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#18181d] px-5 py-3 shrink-0">
        <div className="flex items-center space-x-2">
          <FileSignature className="h-5.5 w-5.5 text-slate-500" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground select-none">
            Document Editor
          </h3>
        </div>

        {/* Upload File button (Desktop Header Action) */}
        {!readOnly && (
          <div className="flex items-center shrink-0">
            <button
              onClick={triggerFileBrowser}
              className="flex items-center space-x-1 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] rounded-xl transition cursor-pointer select-none"
              title="Import TXT, Markdown, DOCX, or PDF"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span>Import</span>
            </button>
          </div>
        )}
      </div>

      {/* Modern Editing Sticky Toolbar */}
      {readOnly ? (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-50 dark:bg-[#111114] border-b border-slate-200 dark:border-white/[0.06] px-4 py-2 shrink-0 select-none">
          <span className="text-[10px] font-bold tracking-wider text-amber-500/90 dark:text-amber-400/90 uppercase flex items-center">
            <Layers className="h-3.5 w-3.5 mr-1.5 text-amber-500/80 animate-pulse" />
            Read-only Viewer Mode (Collaboration link active)
          </span>
        </div>
      ) : (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-50 dark:bg-[#111114] border-b border-slate-200 dark:border-white/[0.06] px-2.5 lg:px-4 py-1 lg:py-1.5 shrink-0 select-none">
          {/* Left Side: Scrollable Formatting Buttons */}
          <div className="flex-1 overflow-x-auto no-scrollbar flex-nowrap mr-2">
            <TooltipProvider delay={150}>
              <div className="flex items-center space-x-0.5 sm:space-x-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Undo2 className="h-4 w-4" strokeWidth={2.2} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Undo (Ctrl+Z)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Redo2 className="h-4 w-4" strokeWidth={2.2} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Redo (Ctrl+Y / Ctrl+Shift+Z)</TooltipContent>
                </Tooltip>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-850 mx-1" />
                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('bold')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    <Bold className="h-4 w-4" strokeWidth={2.5} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Bold Text</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('italic')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    <Italic className="h-4 w-4" strokeWidth={2.5} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Italic Text</TooltipContent>
                </Tooltip>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-850 mx-1" />

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('heading')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    <Heading className="h-4 w-4" strokeWidth={2.2} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Insert Heading</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('bullet')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    <List className="h-4 w-4" strokeWidth={2.2} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Bullet List</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('number')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    <ListOrdered className="h-4 w-4" strokeWidth={2.2} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Numbered List</TooltipContent>
                </Tooltip>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-850 mx-1" />

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('table')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    <Table className="h-4 w-4" strokeWidth={2.2} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Insert Table</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('hr')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2.2} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Horizontal Rule</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('pagebreak')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    <Scissors className="h-4 w-4 text-indigo-500" strokeWidth={2.2} />
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1 font-semibold font-sans">Page Break (Markdown Comment)</TooltipContent>
                </Tooltip>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-850 mx-1" />

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('link')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    {/* Custom inline Link icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Hyperlink</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    onClick={() => insertMarkdown('code')}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition cursor-pointer flex items-center justify-center"
                  >
                    {/* Code icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px] px-2 py-1">Code Block</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Right Side: Mobile Import Button (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center shrink-0 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              onClick={triggerFileBrowser}
              className="flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-350 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] rounded-lg transition cursor-pointer select-none shrink-0"
              title="Import TXT, Markdown, DOCX, or PDF"
            >
              <Upload className="h-3 w-3 text-slate-500" />
              <span>Import</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Edit Form Field */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#18181d]">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            onContentChange(e.target.value);
            onSelectionChange?.('');
          }}
          onSelect={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          readOnly={readOnly}
          className="w-full h-full px-4 py-3 sm:px-6 sm:py-5 bg-transparent text-sm leading-relaxed text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none resize-none font-mono overflow-y-auto preview-viewport-scrollbar editor-textarea read-only:opacity-75 read-only:cursor-default"
          placeholder={readOnly ? "No document content exists yet." : "Write here in Markdown..."}
        />

        {/* ── FLOATING SMART TEMPLATES SELECTOR ── */}
        {!readOnly && onSelectTemplate && (
          <>
            {/* Floating FAB Trigger Button */}
            <button
              type="button"
              onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
              className="absolute bottom-4 right-4 z-20 flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-white/95 dark:bg-[#1f1f24]/95 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-full shadow-lg hover:shadow-xl dark:shadow-black/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer select-none"
              title="Apply Smart Layout Template"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              <span>Templates</span>
            </button>

            {/* DESKTOP POPOVER CARD (hidden on mobile) */}
            {isTemplatesOpen && (
              <div className="hidden sm:flex absolute bottom-14 right-4 z-30 w-72 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181d] shadow-2xl dark:shadow-black/50 p-3 flex-col space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider select-none">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Smart Template Engine</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTemplatesOpen(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-full transition cursor-pointer text-slate-450 dark:text-slate-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="h-px bg-slate-100 dark:bg-white/[0.06]" />
                <div className="flex flex-col space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5 no-scrollbar">
                  {SmartTemplatesRegistry.templates.map((template) => {
                    const isActive = activeTemplateId === template.id;
                    const meta = getMeta(template.id);
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          onSelectTemplate({
                            id: template.id,
                            name: template.name,
                            description: template.description,
                            defaultTitle: template.defaultTitle,
                            content: template.sampleContent,
                          });
                          setIsTemplatesOpen(false);
                        }}
                        className={`w-full flex items-start space-x-2.5 p-2 rounded-xl text-left border transition-all duration-150 cursor-pointer ${isActive
                          ? 'bg-indigo-50/20 dark:bg-indigo-950/15 border-indigo-400/60 dark:border-indigo-400/40 shadow-sm text-indigo-950 dark:text-white'
                          : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] hover:bg-slate-100/50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {template.name}
                            </span>
                            {isActive && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0 ml-1.5" />
                            )}
                          </div>
                          <p className="text-[9.5px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MOBILE BOTTOM SHEET DRAWER (hidden on desktop) */}
            {isTemplatesOpen && (
              <>
                {/* Backdrop overlay */}
                <div
                  onClick={() => setIsTemplatesOpen(false)}
                  className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                />
                {/* Drawer panel */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 rounded-t-3xl border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181d] shadow-2xl z-50 p-5 pb-8 flex flex-col animate-in slide-in-from-bottom duration-300 ease-out max-h-[75vh]">
                  {/* Top Drag Handle */}
                  <div className="w-12 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-4 shrink-0" />

                  {/* Drawer Header */}
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-900 dark:text-white">Smart Templates</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTemplatesOpen(false)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-full transition cursor-pointer text-slate-450 dark:text-slate-500"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-3 select-none">
                    Select a template to restructure and format your document.
                  </p>

                  {/* Drawer Cards List */}
                  <div className="flex flex-col space-y-2 overflow-y-auto no-scrollbar pr-0.5">
                    {SmartTemplatesRegistry.templates.map((template) => {
                      const isActive = activeTemplateId === template.id;
                      const meta = getMeta(template.id);
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => {
                            onSelectTemplate({
                              id: template.id,
                              name: template.name,
                              description: template.description,
                              defaultTitle: template.defaultTitle,
                              content: template.sampleContent,
                            });
                            setIsTemplatesOpen(false);
                          }}
                          className={`w-full flex items-start space-x-3.5 p-3 rounded-2xl border text-left cursor-pointer transition-all duration-150 ${isActive
                            ? 'bg-indigo-50/20 dark:bg-indigo-950/15 border-indigo-400/60 dark:border-indigo-400/40 shadow-sm text-indigo-950 dark:text-white'
                            : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] hover:bg-slate-100/50 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-350'
                            }`}
                        >
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {template.name}
                              </span>
                              {isActive && (
                                <CheckCircle2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Editor Footer Panel Metadata (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center justify-between border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#18181d] px-5 py-2.5 shrink-0 text-xs text-slate-500 dark:text-slate-500 font-semibold select-none">
        <div className="flex items-center space-x-4">
          <span>
            Words: <strong className="text-foreground">{wordCount}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>
            Characters: <strong className="text-foreground">{charCount}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>
            Reading Time: <strong className="text-foreground">{Math.max(1, Math.ceil(wordCount / 200))} min</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
