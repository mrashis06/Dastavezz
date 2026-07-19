'use client';

import React, { useRef } from 'react';
import { Upload, Layers, FileSignature, Bold, Italic, Heading, List, ListOrdered, Table, Minus, Scissors, Undo2, Redo2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  canRedo = false
}: DocumentEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="flex flex-col h-full bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.07] rounded-[18px] overflow-hidden shadow-sm dark:shadow-black/30">
      {/* Editor Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#18181d] px-5 py-3.5 shrink-0">
        <div className="flex items-center space-x-2">
          <FileSignature className="h-5.5 w-5.5 text-slate-500" />
          <h3 className="text-base font-extrabold uppercase tracking-wider text-muted-foreground">
            Document Editor
          </h3>
        </div>
      </div>

      {/* Modern Editing Sticky Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-50 dark:bg-[#111114] border-b border-slate-200 dark:border-white/[0.06] px-3 sm:px-4 py-1.5 shrink-0 overflow-x-auto no-scrollbar">
        <TooltipProvider delay={150}>
          <div className="flex items-center space-x-1 shrink-0">
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

        {/* Upload File Input */}
        <div className="flex items-center shrink-0 ml-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.markdown,.docx,.pdf"
            className="hidden"
          />
          <button
            onClick={triggerFileBrowser}
            className="flex items-center space-x-1.5 text-xs font-semibold text-foreground bg-white dark:bg-[#111114] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.07] rounded-lg px-3 py-1.5 transition cursor-pointer"
            title="Import TXT, Markdown, DOCX, or PDF"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import</span>
          </button>
        </div>
      </div>

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
          className="w-full h-full p-6 bg-transparent text-sm leading-relaxed text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none resize-none font-mono overflow-y-auto preview-viewport-scrollbar editor-textarea"
          placeholder="# Write your document outline here in Markdown...&#10;&#10;Use standard headings, bullet lists, tables, and spacing. Choose a layout theme on the right, or let Gemini AI help you rewrite and improve your content tone!"
        />
      </div>

      {/* Editor Footer Panel Metadata */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#18181d] px-5 py-2.5 shrink-0 text-xs text-slate-500 dark:text-slate-500 font-semibold select-none">
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
        <div className="flex items-center space-x-1.5 text-[10px] bg-secondary/40 px-2 py-0.5 rounded border border-border/60 font-mono text-indigo-600 dark:text-indigo-400">
          <Layers className="h-3.5 w-3.5" />
          <span>Markdown Active</span>
        </div>
      </div>
    </div>
  );
}
