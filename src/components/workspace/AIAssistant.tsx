'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  X,
  FileCheck2,
  ArrowDownToLine,
  MousePointerClick,
  Eye,
  Languages,
  Briefcase,
  Layout,
  FilePlus,
  AlignLeft,
  ArrowRight
} from 'lucide-react';
import { runCustomCommand } from '../../services/gemini';

interface AIAssistantProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onTitleChange: (newTitle: string) => void;
  title: string;
  templateId: string | null;
  selectedText?: string;
  wordCount: number;
  onAICheckpoint?: (actionLabel: string, newTitle?: string, newContent?: string) => void;
  readOnly?: boolean;
}

type ActionKey = 'optimize' | 'humanize' | 'rewrite' | 'format' | 'continue' | 'summarize';

interface AIAction {
  key: ActionKey;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  iconBg: string;
}

const ACTIONS: AIAction[] = [
  {
    key: 'optimize',
    icon: <Sparkles className="h-4 w-4" />,
    label: 'Optimize Document',
    description: 'Fix grammar, improve sentence flow, clarity, and formatting in one click',
    color: 'text-violet-500 dark:text-violet-450',
    iconBg: 'bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20'
  },
  {
    key: 'humanize',
    icon: <Languages className="h-4 w-4" />,
    label: 'Humanize',
    description: 'Make the text sound natural, fluent, and human-written',
    color: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20'
  },
  {
    key: 'rewrite',
    icon: <Briefcase className="h-4 w-4" />,
    label: 'Professional Rewrite',
    description: 'Rewrite the document using a selected professional writing style',
    color: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20'
  },
  {
    key: 'format',
    icon: <Layout className="h-4 w-4" />,
    label: 'Improve Formatting',
    description: 'Refine visual structure, lists, tables, and spacing without switching templates',
    color: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20'
  },
  {
    key: 'continue',
    icon: <FilePlus className="h-4 w-4" />,
    label: 'Continue Writing',
    description: 'Autogenerate the next logical section based on layout context',
    color: 'text-rose-500 dark:text-rose-400',
    iconBg: 'bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20'
  },
  {
    key: 'summarize',
    icon: <AlignLeft className="h-4 w-4" />,
    label: 'Summarize',
    description: 'Generate a concise summary matching your chosen layout',
    color: 'text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20'
  }
];

const ACTION_LABEL_MAP: Record<ActionKey, string> = {
  optimize: 'Optimize Document',
  humanize: 'Humanize',
  rewrite: 'Professional Rewrite',
  format: 'Improve Formatting',
  continue: 'Continue Writing',
  summarize: 'Summarize'
};

export default function AIAssistant({
  content,
  onContentChange,
  onTitleChange,
  title,
  templateId,
  selectedText,
  wordCount,
  onAICheckpoint,
  readOnly = false
}: AIAssistantProps) {
  const [aiOutput, setAiOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);
  const [runningAction, setRunningAction] = useState<ActionKey | null>(null);
  const [copied, setCopied] = useState(false);

  // Sub-action modal overlays state
  const [modalType, setModalType] = useState<'rewrite' | 'summarize' | null>(null);

  // Full-screen blur preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewLabel, setPreviewLabel] = useState('');

  // Refs for auto-scroll-into-view
  const resultRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const contextObj = {
    template: templateId,
    title,
    content,
    selectedText,
    wordCount
  };

  // Auto-scroll to result when it appears
  useEffect(() => {
    if (aiOutput && !isLoading && resultRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }, [aiOutput, isLoading]);

  // Handlers
  const handleAIAction = async (actionKey: ActionKey, optionValue?: string) => {
    // Open selector modal if sub-option is required but not passed
    if (actionKey === 'rewrite' && !optionValue) {
      setModalType('rewrite');
      return;
    }
    if (actionKey === 'summarize' && !optionValue) {
      setModalType('summarize');
      return;
    }

    const sourceText = selectedText && selectedText.trim() ? selectedText : content;
    if (!sourceText.trim()) return;

    // Reset select modal
    setModalType(null);

    setIsLoading(true);
    setRunningAction(actionKey);
    setActiveAction(actionKey);
    setAiOutput('');

    // Construct custom prompt command based on action key and options
    let command = '';
    if (actionKey === 'optimize') {
      command = 'Optimize the document content. Correct any spelling or grammar mistakes, improve readability, refine sentence flow to sound fluid, enhance formatting, ensure clean line spacing, and maintain consistent heading structures. Preserve the original meaning of the text. Return ONLY the improved document in Markdown with zero intro or extra commentary.';
    } else if (actionKey === 'humanize') {
      command = 'Rewrite the document text to make it sound completely natural, fluent, and human-written while preserving the original meaning. Remove robotic syntax, improve readability flow, use natural sentence length variations, and write in a professional yet human tone. Return ONLY the humanized document in Markdown.';
    } else if (actionKey === 'rewrite') {
      command = `Rewrite the document using a selected professional writing style: ${optionValue}. Adapt vocabulary, sentence structures, and tone to fit the ${optionValue} style perfectly. Preserve the original core intent of the text. Return ONLY the rewritten Markdown content.`;
    } else if (actionKey === 'format') {
      command = `Improve the visual structure and layout of the text. Refine heading hierarchy, list bullet formats, tables alignment, paragraph spacing, and overall section organization to make the document highly readable. Do NOT change or switch the current template context (e.g. keep it as a ${templateId || 'document'}). Return ONLY the updated formatted Markdown text.`;
    } else if (actionKey === 'continue') {
      command = `Based on the following document context, generate the next logical paragraph or section. Match the existing writing style, tone, format, and layout structure exactly. Connect smoothly to where the text ends. Return ONLY the generated continuation text in Markdown.`;
    } else if (actionKey === 'summarize') {
      command = `Generate a concise summary of the document. Format the summary as a ${optionValue}. Retain all key facts and deliverables. Return ONLY the summary content in Markdown.`;
    }

    try {
      const res = await runCustomCommand(sourceText, command, contextObj);
      if (res.success) {
        setAiOutput(res.content);
      } else {
        throw new Error(res.error || 'Gemini error');
      }
    } catch (err) {
      setAiOutput(err instanceof Error ? `Error: ${err.message}` : 'Error: Unable to reach Dastavezz AI.');
    } finally {
      setIsLoading(false);
      setRunningAction(null);
    }
  };

  const handleDismiss = () => {
    setAiOutput('');
    setActiveAction(null);
  };

  const handleCopy = () => {
    if (aiOutput) {
      navigator.clipboard.writeText(aiOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyToDocument = () => {
    if (aiOutput) {
      const label = activeAction ? ACTION_LABEL_MAP[activeAction] : 'Applied AI';
      onAICheckpoint?.(`AI: ${label}`, title, aiOutput);
      onContentChange(aiOutput);
      handleDismiss();
    }
  };

  const handleInsertBelow = () => {
    if (aiOutput) {
      const label = activeAction ? ACTION_LABEL_MAP[activeAction] : 'Inserted AI';
      const newContent = content + '\n\n' + aiOutput;
      onAICheckpoint?.(`AI Insert: ${label}`, title, newContent);
      onContentChange(newContent);
      handleDismiss();
    }
  };

  const handleReplaceSelection = () => {
    if (!selectedText || !aiOutput) return;
    const newContent = content.replace(selectedText, aiOutput);
    onAICheckpoint?.(`AI Replace Selection`, title, newContent);
    onContentChange(newContent);
    handleDismiss();
  };

  const openPreview = (previewText: string, label: string) => {
    setPreviewContent(previewText);
    setPreviewLabel(label);
    setPreviewOpen(true);
  };

  const hasResult = aiOutput && !isLoading;

  return (
    <>
      {/* ─── Full-Screen Blurred Preview Modal ──────────────────────────────── */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-[#1e1e24] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.07] shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-650">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{previewLabel}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Dastavezz AI Preview</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#111114]">
              <pre className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono no-scrollbar">
                {previewContent}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-100 dark:border-white/[0.06] p-4 flex items-center justify-between space-x-3 shrink-0 bg-white dark:bg-[#1e1e24]">
              <button
                onClick={() => { handleCopy(); setPreviewOpen(false); }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.07] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-white/[0.08]"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { handleInsertBelow(); setPreviewOpen(false); }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-white/[0.07]"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  <span>Insert Below</span>
                </button>
                <button
                  onClick={() => { handleApplyToDocument(); setPreviewOpen(false); }}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>Apply to Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Panel ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col bg-white dark:bg-[#18181d] lg:border lg:border-slate-200 lg:dark:border-white/[0.07] lg:rounded-2xl overflow-hidden h-full lg:shadow-sm dark:shadow-black/30 relative">
        
        {/* Sub-Action Modal Selector Overlays */}
        {modalType === 'rewrite' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-[260px] p-4 flex flex-col space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Choose Writing Tone</span>
                <button onClick={() => setModalType(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-md transition text-slate-400 shrink-0 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {['Professional', 'Academic', 'Business', 'Technical', 'Formal', 'Concise'].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => handleAIAction('rewrite', tone)}
                    className="px-2.5 py-2 text-left text-xs font-medium rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-violet-500/20 dark:hover:border-violet-500/30 cursor-pointer transition"
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {modalType === 'summarize' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-[260px] p-4 flex flex-col space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-155 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Choose Format</span>
                <button onClick={() => setModalType(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-md transition text-slate-400 shrink-0 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-col space-y-1.5">
                {['Short Summary', 'Detailed Summary', 'Bullet Summary'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => handleAIAction('summarize', format)}
                    className="w-full px-3 py-2.5 text-left text-xs font-medium rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.06] hover:border-violet-500/20 dark:hover:border-violet-500/30 cursor-pointer transition"
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none">Dastavezz AI</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium font-sans">Premium Writing Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Active</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar">

          {/* Action Cards */}
          <div className="p-4 space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-0.5 mb-3 select-none">
              AI ACTIONS
              {selectedText && selectedText.trim() && (
                <span className="ml-2 text-[8px] bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900 px-1.5 py-0.5 rounded-full font-bold">
                  Selection active
                </span>
              )}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {ACTIONS.map((action) => {
                const isRunning = runningAction === action.key;
                const isThisActive = activeAction === action.key && hasResult;

                return (
                  <div
                    key={action.key}
                    className={`rounded-xl border transition-all duration-250 overflow-hidden ${
                      isThisActive
                        ? 'border-violet-200 dark:border-violet-500/30 bg-violet-50/30 dark:bg-violet-500/10'
                        : 'border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:border-slate-200 dark:hover:border-white/[0.12] hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-transform duration-200'
                    }`}
                  >
                    {/* Card main row */}
                    <div className="flex items-center p-3.5 space-x-3.5">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${action.iconBg} ${action.color} transition-all duration-200`}>
                        {isRunning ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : action.icon}
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-white block leading-tight">{action.label}</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">{action.description}</p>
                      </div>
                      {/* Action trigger button */}
                      <button
                        onClick={() => handleAIAction(action.key)}
                        disabled={isLoading || (!content && !selectedText) || readOnly}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[9.5px] font-extrabold transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                          isThisActive
                            ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
                            : 'bg-slate-900 dark:bg-white/[0.06] hover:bg-slate-800 dark:hover:bg-white/[0.1] text-white dark:text-slate-200 border border-slate-200/20 dark:border-white/[0.05]'
                        }`}
                      >
                        {isRunning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        <span>{isThisActive ? 'Retry' : 'Run'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mx-4 mb-4 rounded-xl border border-violet-100 dark:border-violet-500/20 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-500/10 dark:to-indigo-500/10 p-6 flex flex-col items-center space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-white/[0.06] shadow-sm">
                <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {runningAction ? ACTION_LABEL_MAP[runningAction] : 'Processing'}…
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Dastavezz AI is thinking</p>
              </div>
              <div className="flex space-x-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* AI Result Card (auto-scroll target) */}
          {hasResult && (
            <div ref={resultRef} className="mx-4 mb-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1e1e24] shadow-sm dark:shadow-black/30 overflow-hidden">
              {/* Result Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#111114]">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500 animate-pulse" />
                  <span className="text-[10px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    {activeAction ? ACTION_LABEL_MAP[activeAction] : 'AI Result'}
                  </span>
                  {templateId && (
                    <span className="text-[9px] bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide border border-slate-200 dark:border-white/[0.07]">
                      {templateId.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openPreview(aiOutput, activeAction ? ACTION_LABEL_MAP[activeAction] : 'AI Result')}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.07] border border-slate-200 dark:border-white/[0.08] text-[9.5px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </button>
                  <button onClick={handleDismiss} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.07] text-slate-400 transition cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Generated Content */}
              <div className="p-4 max-h-56 overflow-y-auto preview-viewport-scrollbar">
                <p className="text-[12px] leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-mono">
                  {aiOutput}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 dark:border-white/[0.06] p-3 space-y-2 shrink-0">
                {!readOnly && (
                  <button
                    onClick={handleApplyToDocument}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-violet-600 dark:hover:bg-violet-750 text-white text-xs font-bold transition duration-150 cursor-pointer shadow-sm"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Apply to Document</span>
                  </button>
                )}
                <div className={readOnly ? "grid grid-cols-1" : "grid grid-cols-3 gap-1.5"}>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center space-x-1.5 px-2 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.07] text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer w-full"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  {!readOnly && (
                    <>
                      <button
                        onClick={handleInsertBelow}
                        className="flex items-center justify-center space-x-1.5 px-2 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.07] text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        <span>Insert</span>
                      </button>
                      <button
                        onClick={handleReplaceSelection}
                        disabled={!selectedText}
                        className="flex items-center justify-center space-x-1.5 px-2 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.07] text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <MousePointerClick className="h-3.5 w-3.5" />
                        <span>Replace</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
