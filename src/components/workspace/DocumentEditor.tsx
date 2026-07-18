'use client';

import React, { useRef } from 'react';
import { Upload, FileDown, Layers, FileSignature } from 'lucide-react';

interface DocumentEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  wordCount: number;
  charCount: number;
}

export default function DocumentEditor({
  content,
  onContentChange,
  wordCount,
  charCount
}: DocumentEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler (reads client-side TXT or Markdown file content)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result;
      if (typeof fileContent === 'string') {
        onContentChange(fileContent);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-card/10 border border-border/60 rounded-xl overflow-hidden">
      {/* Editor Panel Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-card/30 px-5 py-3 shrink-0">
        <div className="flex items-center space-x-2">
          <FileSignature className="h-4.5 w-4.5 text-violet-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Document Editor
          </h3>
        </div>
        
        {/* Import Files Button */}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.markdown"
            className="hidden"
          />
          <button
            onClick={triggerFileBrowser}
            className="flex items-center space-x-1.5 text-xs font-medium text-foreground hover:bg-secondary/60 border border-border/80 rounded-md px-3 py-1.5 transition cursor-pointer"
            title="Import Markdown or Text file"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import Document</span>
          </button>
        </div>
      </div>

      {/* Main Edit Form Field */}
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full h-full min-h-[450px] p-6 bg-transparent text-sm leading-relaxed text-foreground placeholder-muted-foreground/60 focus:outline-none resize-none font-mono"
          placeholder="# Write your document outline here in Markdown...&#10;&#10;Use standard headings, bullet points, tables, and spacing. Then choose a layout theme or let Gemini AI improve your writing tone on the right!"
        />
      </div>

      {/* Editor Footer Panel Metadata */}
      <div className="flex items-center justify-between border-t border-border/60 bg-card/30 px-5 py-2.5 shrink-0 text-xs text-muted-foreground font-medium">
        <div className="flex space-x-4">
          <span>
            Words: <strong className="text-foreground">{wordCount}</strong>
          </span>
          <span>
            Characters: <strong className="text-foreground">{charCount}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-1 text-[10px] bg-secondary/30 px-2 py-0.5 rounded border border-border/40 font-mono text-indigo-300">
          <Layers className="h-3 w-3" />
          <span>Markdown Active</span>
        </div>
      </div>
    </div>
  );
}
