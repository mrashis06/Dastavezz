'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  FileText,
  RotateCcw,
  Check,
  X,
  History,
  CheckCircle2,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { compileMarkdownToHtml } from '@/utils/markdown';
import DastavezzIcon from '@/components/brand/DastavezzIcon';

interface TemplateComparisonProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  originalContent: string;
  transformedContent: string;
  templateName: string;
  isAI: boolean;
  isLoading: boolean;
  onApply: () => void;
  onRegenerate?: () => void;
}

export default function TemplateComparison({
  isOpen,
  onOpenChange,
  originalContent,
  transformedContent,
  templateName,
  isAI,
  isLoading,
  onApply,
  onRegenerate,
}: TemplateComparisonProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOriginalExpandedMobile, setIsOriginalExpandedMobile] = useState(false);

  // Animate loading progress steps
  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(3);
      return;
    }
    setCurrentStep(0);
    const t1 = setTimeout(() => setCurrentStep(1), 600);
    const t2 = setTimeout(() => setCurrentStep(2), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isLoading]);

  const transformedHtml = compileMarkdownToHtml(transformedContent || '');
  const wordCountOriginal = originalContent ? originalContent.trim().split(/\s+/).length : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1240px] w-[100vw] sm:w-[96vw] h-[100dvh] sm:h-[90vh] max-h-[100dvh] sm:max-h-[880px] p-0 rounded-none sm:rounded-2xl md:rounded-[28px] bg-[#0c0c0f] border-0 sm:border border-white/[0.08] text-white shadow-2xl flex flex-col overflow-hidden select-none">
        
        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <DialogHeader className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 border-b border-white/[0.06] flex flex-row items-center justify-between shrink-0 space-y-0 bg-[#0e0e12]">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <DastavezzIcon size={32} className="shrink-0 sm:w-9 sm:h-9" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <DialogTitle className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight truncate">
                  Smart Template Conversion
                </DialogTitle>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25 shrink-0">
                  <Sparkles className="h-3 w-3 mr-1 text-violet-400" />
                  {templateName}
                </span>
              </div>
              <DialogDescription className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-normal truncate max-w-xl">
                Review AI-generated formatting enhancements before applying.
              </DialogDescription>
            </div>
          </div>

          {/* Right AI Stats Badge */}
          <div className="hidden lg:flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shrink-0 ml-4">
            <div className="h-8 w-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <Wand2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                AI Layout Engine
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Formatting enhanced
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* ── MAIN BODY WORKSPACE ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-3 sm:gap-5 p-3 sm:p-5 md:p-7 overflow-y-auto lg:overflow-hidden min-h-0 bg-[#09090b]">
          
          {/* ── ORIGINAL DOCUMENT PANEL (Collapsible on Mobile) ───────────── */}
          <div className="flex flex-col rounded-xl sm:rounded-2xl bg-[#121216] border border-white/[0.07] overflow-hidden shrink-0 lg:shrink lg:min-w-0 shadow-sm">
            
            {/* Header / Disclosure bar */}
            <button
              type="button"
              onClick={() => setIsOriginalExpandedMobile(!isOriginalExpandedMobile)}
              className="w-full px-4 sm:px-5 py-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between cursor-pointer lg:cursor-default"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-200 tracking-wide">
                  Original Document
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded ml-1">
                  {wordCountOriginal} words
                </span>
              </div>
              <div className="lg:hidden text-slate-400">
                {isOriginalExpandedMobile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            
            {/* Body content */}
            <div className={`p-4 sm:p-6 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap select-text ${isOriginalExpandedMobile ? 'block max-h-60 lg:max-h-none' : 'hidden lg:block lg:flex-1'}`}>
              {originalContent || <span className="italic text-slate-500">Empty document</span>}
            </div>
          </div>

          {/* ── AI TEMPLATE PREVIEW PANEL (Primary Space on Mobile) ──────── */}
          <div className="flex-1 flex flex-col rounded-xl sm:rounded-2xl bg-[#121216] border border-white/[0.07] overflow-hidden min-w-0 shadow-sm min-h-[350px] lg:min-h-0">
            <div className="px-4 sm:px-5 py-3 bg-violet-950/20 border-b border-white/[0.06] flex items-center justify-between shrink-0 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  AI Template Preview
                </span>
              </div>

              {/* Chips */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                  Headings
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  Bullets
                </span>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-y-auto relative bg-[#0e0e12] min-h-0">
              
              {/* LOADING SKELETON */}
              {isLoading ? (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/20 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-violet-300">
                      <Sparkles className="h-4 w-4 animate-spin text-violet-400" />
                      <span>Generating smart layout preview...</span>
                    </div>

                    <div className="space-y-1.5 pt-1 text-[11px]">
                      <div className={`flex items-center space-x-2 ${currentStep >= 0 ? 'opacity-100 text-emerald-400' : 'opacity-30'}`}>
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Understanding document structure</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'opacity-100 text-emerald-400' : 'opacity-30'}`}>
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Detecting headings & sections</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'opacity-100 text-violet-300' : 'opacity-30'}`}>
                        <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-violet-400" />
                        <span>Applying {templateName} template</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="h-7 w-3/4 bg-white/[0.08] rounded-xl animate-pulse" />
                    <div className="h-4 w-1/2 bg-white/[0.06] rounded-lg animate-pulse" />
                    <div className="space-y-2 pt-2">
                      <div className="h-3.5 w-full bg-white/[0.04] rounded animate-pulse" />
                      <div className="h-3.5 w-11/12 bg-white/[0.04] rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : transformedContent ? (
                
                /* RENDERED PREVIEW SHEET */
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#15151b] border border-white/[0.08] shadow-md rounded-xl sm:rounded-2xl p-4 sm:p-7 prose dark:prose-invert max-w-none text-xs text-slate-200 leading-relaxed select-text"
                  dangerouslySetInnerHTML={{ __html: transformedHtml }}
                />

              ) : (
                
                /* EMPTY STATE */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">
                      AI is preparing your layout
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Your template preview will appear here shortly.
                    </p>
                  </div>
                </div>

              )}

            </div>
          </div>

        </div>

        {/* ── STICKY FOOTER ACTIONS (ALWAYS VISIBLE ON MOBILE) ─────────────── */}
        <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-[#0e0e12] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 sticky bottom-0 z-30">
          
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 min-w-0">
            <History className="h-4 w-4 text-violet-400 shrink-0" />
            <span className="truncate">
              A version snapshot is saved before applying.
            </span>
          </div>

          {/* Action buttons (Sticky full width on mobile) */}
          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl cursor-pointer flex-1 sm:flex-initial"
            >
              Cancel
            </Button>

            {onRegenerate && (
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={onRegenerate}
                className="h-10 px-4 text-xs font-semibold border-white/[0.1] text-slate-200 hover:bg-white/[0.05] rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 flex-1 sm:flex-initial"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </Button>
            )}

            <Button
              type="button"
              disabled={isLoading || !transformedContent}
              onClick={onApply}
              className="h-10 px-5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl cursor-pointer shadow-lg shadow-violet-500/25 flex items-center justify-center space-x-1.5 flex-1 sm:flex-initial whitespace-nowrap"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Template</span>
            </Button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
