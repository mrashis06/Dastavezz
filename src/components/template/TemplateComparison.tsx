'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const wordCountTransformed = transformedContent ? transformedContent.trim().split(/\s+/).length : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1240px] w-[96vw] h-[90vh] max-h-[880px] p-0 rounded-2xl md:rounded-[28px] bg-[#0c0c0f] border border-white/[0.08] text-white shadow-2xl shadow-black/80 flex flex-col overflow-hidden select-none sm:max-w-none">
        
        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 md:px-8 py-5 border-b border-white/[0.06] flex flex-row items-center justify-between shrink-0 space-y-0 bg-[#0e0e12]">
          <div className="flex items-center space-x-4 min-w-0">
            <DastavezzIcon size={38} className="shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <DialogTitle className="text-lg md:text-xl font-bold text-white tracking-tight whitespace-nowrap">
                  Smart Template Conversion
                </DialogTitle>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25 shrink-0">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-violet-400" />
                  {templateName}
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-400 mt-1 font-normal truncate max-w-xl">
                Review AI-generated formatting and structural enhancements before applying to your document.
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
                18 formatting improvements
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* ── TWO-COLUMN BODY WORKSPACE ──────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 md:p-7 overflow-hidden min-h-0 bg-[#09090b]">
          
          {/* ── LEFT COLUMN: Original Document ──────────────────────────── */}
          <div className="flex flex-col rounded-2xl bg-[#121216] border border-white/[0.07] overflow-hidden min-w-0 shadow-sm">
            <div className="px-5 py-3.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-200 tracking-wide">
                  Original Document
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-white/[0.06] px-2.5 py-0.5 rounded-md">
                {wordCountOriginal} words
              </span>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap min-h-0 select-text">
              {originalContent || <span className="italic text-slate-500">Empty document</span>}
            </div>
          </div>

          {/* ── RIGHT COLUMN: AI Template Preview ────────────────────────── */}
          <div className="flex flex-col rounded-2xl bg-[#121216] border border-white/[0.07] overflow-hidden min-w-0 shadow-sm">
            <div className="px-5 py-3.5 bg-violet-950/20 border-b border-white/[0.06] flex items-center justify-between shrink-0 flex-wrap gap-2">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  AI Template Preview
                </span>
              </div>

              {/* Improvement Chips */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                  Headings
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  Bullets
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                  Hierarchy
                </span>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto relative bg-[#0e0e12] min-h-0">
              
              {/* LOADING SKELETON + STEP PROGRESS */}
              {isLoading ? (
                <div className="space-y-6">
                  
                  {/* Step Progress Indicators */}
                  <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/20 space-y-2.5">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-violet-300">
                      <Sparkles className="h-4 w-4 animate-spin text-violet-400" />
                      <span>Generating smart layout preview...</span>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      <div className={`flex items-center space-x-2.5 transition-opacity duration-300 ${currentStep >= 0 ? 'opacity-100 text-emerald-400 font-medium' : 'opacity-30'}`}>
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Understanding document structure</span>
                      </div>
                      <div className={`flex items-center space-x-2.5 transition-opacity duration-300 ${currentStep >= 1 ? 'opacity-100 text-emerald-400 font-medium' : 'opacity-30'}`}>
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Detecting headings & contact information</span>
                      </div>
                      <div className={`flex items-center space-x-2.5 transition-opacity duration-300 ${currentStep >= 2 ? 'opacity-100 text-violet-300 font-medium' : 'opacity-30'}`}>
                        <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-violet-400" />
                        <span>Applying {templateName} template rules</span>
                      </div>
                    </div>
                  </div>

                  {/* Skeleton Placeholder Bars */}
                  <div className="space-y-4 pt-2">
                    <div className="h-8 w-3/4 bg-white/[0.08] rounded-xl animate-pulse" />
                    <div className="h-5 w-1/2 bg-white/[0.06] rounded-lg animate-pulse" />
                    <div className="space-y-2.5 pt-2">
                      <div className="h-4 w-full bg-white/[0.04] rounded animate-pulse" />
                      <div className="h-4 w-11/12 bg-white/[0.04] rounded animate-pulse" />
                      <div className="h-4 w-4/5 bg-white/[0.04] rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-2/5 bg-white/[0.07] rounded-lg animate-pulse pt-4" />
                    <div className="space-y-2.5">
                      <div className="h-4 w-full bg-white/[0.04] rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-white/[0.04] rounded animate-pulse" />
                    </div>
                  </div>

                </div>
              ) : transformedContent ? (
                
                /* RENDERED TEMPLATE CANVAS SHEET */
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#15151b] border border-white/[0.08] shadow-md rounded-2xl p-7 prose dark:prose-invert max-w-none text-xs text-slate-200 leading-relaxed select-text"
                  dangerouslySetInnerHTML={{ __html: transformedHtml }}
                />

              ) : (
                
                /* EMPTY PREVIEW ILLUSTRATION STATE */
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="h-16 w-16 rounded-3xl bg-violet-500/20 text-violet-400 flex items-center justify-center shadow-lg shadow-violet-500/10">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <h4 className="text-sm font-bold text-white">
                      AI is preparing your layout
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your formatted template preview will appear here in just a few seconds.
                    </p>
                  </div>
                </div>

              )}

            </div>
          </div>

        </div>

        {/* ── FOOTER ACTIONS ─────────────────────────────────────────────── */}
        <div className="px-6 md:px-8 py-4 bg-[#0e0e12] border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          
          {/* Left Version Snapshot Info */}
          <div className="flex items-center space-x-2.5 text-xs text-slate-400 min-w-0">
            <History className="h-4 w-4 text-violet-400 shrink-0" />
            <span className="truncate">
              A version snapshot is automatically saved before applying. Restore anytime.
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl cursor-pointer"
            >
              Cancel
            </Button>

            {onRegenerate && (
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={onRegenerate}
                className="h-10 px-5 text-xs font-semibold border-white/[0.1] text-slate-200 hover:bg-white/[0.05] rounded-xl cursor-pointer flex items-center space-x-2 shrink-0"
              >
                <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </Button>
            )}

            <motion.div whileHover={{ y: -1 }}>
              <Button
                type="button"
                disabled={isLoading || !transformedContent}
                onClick={onApply}
                className="h-10 px-6 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl cursor-pointer shadow-lg shadow-violet-500/25 flex items-center space-x-2 whitespace-nowrap shrink-0"
              >
                <Check className="h-4 w-4" />
                <span>Apply Template</span>
              </Button>
            </motion.div>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
