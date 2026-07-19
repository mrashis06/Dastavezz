'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  ArrowRightLeft,
  AlignLeft,
  Type,
  Loader2,
  Copy,
  Check,
  X,
  FileCheck2,
  ArrowDownToLine,
  MousePointerClick,
  Eye
} from 'lucide-react';
import { improveDocument, rewriteProfessionally, summarizeDocument, suggestTitles } from '../../services/gemini';

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

type ActionKey = 'improve' | 'professional' | 'summary' | 'title';

const ACTIONS: {
  key: ActionKey;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  iconBg: string;
}[] = [
  {
    key: 'improve',
    icon: <Wand2 className="h-5 w-5" />,
    label: 'Improve Style',
    description: 'Fix grammar, clarity and tone',
    color: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-950/50'
  },
  {
    key: 'professional',
    icon: <ArrowRightLeft className="h-5 w-5" />,
    label: 'Rewrite Formal',
    description: 'Adapt to professional register',
    color: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50'
  },
  {
    key: 'summary',
    icon: <AlignLeft className="h-5 w-5" />,
    label: 'Summarize',
    description: 'Extract key takeaways',
    color: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50'
  },
  {
    key: 'title',
    icon: <Type className="h-5 w-5" />,
    label: 'Suggest Title',
    description: 'AI-ranked title ideas',
    color: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50'
  }
];

const ACTION_LABEL_MAP: Record<ActionKey, string> = {
  improve: 'Improve Style',
  professional: 'Rewrite Formal',
  summary: 'Summarize',
  title: 'Suggest Title'
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
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  // ─── Auto-scroll to result when it appears ────────────────────────────────
  useEffect(() => {
    if (aiOutput && !isLoading && resultRef.current && scrollContainerRef.current) {
      // Scroll the inner scrollable container so result is in view
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }, [aiOutput, isLoading]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAIAction = async (actionType: ActionKey) => {
    if (!content && actionType !== 'title') return;

    setIsLoading(true);
    setRunningAction(actionType);
    setActiveAction(actionType);
    setAiOutput('');
    setTitleSuggestions([]);

    try {
      if (actionType === 'improve') {
        const res = await improveDocument(content, contextObj);
        if (res.success) setAiOutput(res.content);
      } else if (actionType === 'professional') {
        const res = await rewriteProfessionally(content, contextObj);
        if (res.success) setAiOutput(res.content);
      } else if (actionType === 'summary') {
        const res = await summarizeDocument(content, contextObj);
        if (res.success) setAiOutput(res.content);
      } else if (actionType === 'title') {
        const suggestions = await suggestTitles(contextObj);
        setTitleSuggestions(suggestions);
        setAiOutput('TITLE_MODE');
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
    setTitleSuggestions([]);
    setActiveAction(null);
  };

  const handleCopy = () => {
    if (aiOutput && aiOutput !== 'TITLE_MODE') {
      navigator.clipboard.writeText(aiOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyToDocument = () => {
    if (aiOutput && aiOutput !== 'TITLE_MODE') {
      onAICheckpoint?.(`AI: ${activeAction ? ACTION_LABEL_MAP[activeAction] : 'Applied'}`, title, aiOutput);
      onContentChange(aiOutput);
      handleDismiss();
    }
  };

  const handleInsertBelow = () => {
    if (aiOutput && aiOutput !== 'TITLE_MODE') {
      onAICheckpoint?.(`AI Insert: ${activeAction ? ACTION_LABEL_MAP[activeAction] : 'Inserted'}`, title, content + '\n\n' + aiOutput);
      onContentChange(content + '\n\n' + aiOutput);
      handleDismiss();
    }
  };

  const handleReplaceSelection = () => {
    if (!selectedText || !aiOutput || aiOutput === 'TITLE_MODE') return;
    const newContent = content.replace(selectedText, aiOutput);
    onAICheckpoint?.(`AI Replace Selection`, title, newContent);
    onContentChange(newContent);
    handleDismiss();
  };

  const handleCopySuggestion = (suggestion: string, index: number) => {
    navigator.clipboard.writeText(suggestion);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Open full-screen blur preview
  const openPreview = (previewText: string, label: string) => {
    setPreviewContent(previewText);
    setPreviewLabel(label);
    setPreviewOpen(true);
  };

  const hasResult = aiOutput && !isLoading;
  const isTitleMode = aiOutput === 'TITLE_MODE';

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
            className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-[#1e1e24] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.07] shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
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
                <pre className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono">
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
      <div className="flex flex-col bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.07] rounded-2xl overflow-hidden h-full shadow-sm dark:shadow-black/30">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none">Dastavezz AI</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Action-powered intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Active</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">

          {/* ── Action Cards ── */}
          <div className="p-4 space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-0.5 mb-3 select-none">
              AI Actions
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
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isThisActive
                        ? 'border-violet-200 dark:border-violet-500/30 bg-violet-50/30 dark:bg-violet-500/10'
                        : 'border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Card main row */}
                    <div className="flex items-center p-4 space-x-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.iconBg} ${action.color} transition-all duration-200`}>
                        {isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-slate-800 dark:text-white block">{action.label}</span>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{action.description}</p>
                      </div>
                      {/* Preview button — only shown when this action has a result */}
                      {isThisActive && !isTitleMode && (
                        <button
                          onClick={() => openPreview(aiOutput, ACTION_LABEL_MAP[action.key])}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer shrink-0"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Preview</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleAIAction(action.key)}
                        disabled={isLoading || (!content && action.key !== 'title') || readOnly}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                          isThisActive
                            ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
                            : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-900'
                        }`}
                      >
                        {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        <span>{isThisActive ? 'Retry' : 'Run'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Loading State ── */}
          {isLoading && (
            <div className="mx-4 mb-4 rounded-xl border border-violet-100 dark:border-violet-500/20 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-500/10 dark:to-indigo-500/10 p-6 flex flex-col items-center space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-white/[0.06] shadow-sm">
                <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {runningAction ? ACTION_LABEL_MAP[runningAction] : 'Processing'}…
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Dastavezz AI is thinking</p>
              </div>
              <div className="flex space-x-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── AI Result Card (auto-scroll target) ── */}
          {hasResult && !isTitleMode && (
            <div ref={resultRef} className="mx-4 mb-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1e1e24] shadow-sm dark:shadow-black/30 overflow-hidden">
              {/* Result Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#111114]">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeAction ? ACTION_LABEL_MAP[activeAction] : 'AI Result'}
                  </span>
                  {templateId && (
                    <span className="text-[9px] bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide border border-slate-200 dark:border-white/[0.07]">
                      {templateId.replace('-', ' ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openPreview(aiOutput, activeAction ? ACTION_LABEL_MAP[activeAction] : 'AI Result')}
                    className="flex items-center space-x-1 px-2 py-1 rounded-md bg-white dark:bg-white/[0.07] border border-slate-200 dark:border-white/[0.08] text-[9px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Preview</span>
                  </button>
                  <button onClick={handleDismiss} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.07] text-slate-400 transition cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Generated Content */}
              <div className="p-4 max-h-52 overflow-y-auto">
                <p className="text-[12px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono">
                  {aiOutput}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 dark:border-white/[0.06] p-3 space-y-2">
                {!readOnly && (
                  <button
                    onClick={handleApplyToDocument}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white text-xs font-bold transition duration-150 cursor-pointer shadow-sm"
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

          {/* ── Title Suggestions Card (auto-scroll target) ── */}
          {hasResult && isTitleMode && titleSuggestions.length > 0 && (
            <div ref={resultRef} className="mx-4 mb-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1e1e24] shadow-sm dark:shadow-black/30 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#111114]">
                <div className="flex items-center space-x-2">
                  <Type className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Suggested Titles</span>
                  <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold border border-amber-100 dark:border-amber-900/50">
                    {titleSuggestions.length} ideas
                  </span>
                </div>
                <button onClick={handleDismiss} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.07] text-slate-400 transition cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-3 space-y-1.5">
                {titleSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.07] border border-slate-100 dark:border-white/[0.06] transition duration-150"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/60 shrink-0">{idx + 1}.</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{suggestion}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      {!readOnly && (
                        <button
                          onClick={() => {
                            onAICheckpoint?.(`AI Title: "${suggestion}"`, suggestion, content);
                            onTitleChange(suggestion);
                          }}
                          className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 bg-violet-50 dark:bg-violet-950/50 px-2.5 py-1 rounded-md transition cursor-pointer border border-violet-100 dark:border-violet-900/50"
                        >
                          Use
                        </button>
                      )}
                      <button
                        onClick={() => handleCopySuggestion(suggestion, idx)}
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/[0.07] text-slate-400 transition cursor-pointer"
                      >
                        {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
