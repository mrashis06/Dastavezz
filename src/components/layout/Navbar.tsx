'use client';

import React from 'react';
import { FileText, CloudCheck, CloudSnow, RotateCcw, Sparkles } from 'lucide-react';

interface NavbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onReset: () => void;
  isSaving?: boolean;
}

export default function Navbar({
  title,
  onTitleChange,
  onReset,
  isSaving = false
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 ai-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-violet-400 via-indigo-200 to-white bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Dastavezz
            </h1>
            <p className="text-[10px] font-medium tracking-widest text-indigo-400 uppercase">
              AI Smart Formatter
            </p>
          </div>
        </div>

        {/* Document Title Editor */}
        <div className="flex max-w-md flex-1 items-center space-x-3 px-8">
          <div className="flex items-center space-x-2 rounded-md bg-secondary/40 px-3 py-1.5 border border-border/40 focus-within:border-indigo-500/50 transition duration-200 w-full">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none w-full text-foreground placeholder-muted-foreground"
              placeholder="Unnamed Document"
            />
          </div>
          
          {/* Firebase Save Status */}
          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground shrink-0 bg-secondary/20 px-2 py-1 rounded border border-border/20">
            {isSaving ? (
              <>
                <CloudSnow className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <CloudCheck className="h-3.5 w-3.5 text-green-400" />
                <span className="hidden sm:inline">Saved to Cloud</span>
              </>
            )}
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-secondary/30 hover:bg-secondary/60 border border-border/60 rounded-md px-3.5 py-2 transition duration-200 cursor-pointer"
            title="Clear all workspace contents"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Workspace</span>
          </button>
          
          <div className="hidden lg:flex items-center space-x-1 px-3 py-1 bg-violet-950/30 border border-violet-800/30 text-violet-300 rounded-full text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping mr-1"></span>
            Gemini Flash Active
          </div>
        </div>
      </div>
    </header>
  );
}
