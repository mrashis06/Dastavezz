'use client';

import React, { useState } from 'react';
import { Sparkles, MessageSquareCode, ArrowRightLeft, FileCheck2, Loader2, RefreshCw } from 'lucide-react';
import { improveDocument, rewriteProfessionally, summarizeDocument, generateTitle } from '../../services/gemini';

interface AIAssistantProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onTitleChange: (newTitle: string) => void;
}

export default function AIAssistant({
  content,
  onContentChange,
  onTitleChange
}: AIAssistantProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // General execution handler for Gemini service skeletons
  const handleAIAction = async (actionType: 'improve' | 'professional' | 'summary' | 'title') => {
    if (!content && actionType !== 'title') return;
    
    setIsLoading(true);
    setActiveAction(actionType);
    setAiOutput('');

    try {
      // Simulate network request delays
      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (actionType === 'improve') {
        const response = await improveDocument(content);
        if (response.success) setAiOutput(response.content);
      } else if (actionType === 'professional') {
        const response = await rewriteProfessionally(content);
        if (response.success) setAiOutput(response.content);
      } else if (actionType === 'summary') {
        const response = await summarizeDocument(content);
        if (response.success) setAiOutput(response.content);
      } else if (actionType === 'title') {
        const title = await generateTitle(content);
        onTitleChange(title);
        setAiOutput(`### Generated Suggested Title\n\n**"${title}"**\n\n*The title has been updated in the workspace header.*`);
      }
    } catch (error) {
      setAiOutput('Error: Unable to connect to Gemini AI services.');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  // Custom prompting simulations
  const handleCustomPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsLoading(true);
    setActiveAction('custom');
    setAiOutput('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setAiOutput(`### Response to: "${customPrompt}"\n\nHere is an AI-refined draft matching your instruction:\n\n${content}\n\n*Applied custom tone filter: ${customPrompt}*`);
    } catch {
      setAiOutput('Error: Gemini prompt generation failed.');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
      setCustomPrompt('');
    }
  };

  // Inject AI Output back into editor
  const applyAIPolishedContent = () => {
    if (aiOutput) {
      // Simple parse to remove summary notes if desired, or just replace full text
      onContentChange(aiOutput);
      setAiOutput('');
    }
  };

  return (
    <div className="flex flex-col bg-card/20 border border-border/60 rounded-xl overflow-hidden h-full">
      {/* AI Assistant Header */}
      <div className="flex items-center space-x-2 border-b border-border/60 bg-card/30 px-5 py-3 shrink-0">
        <Sparkles className="h-4.5 w-4.5 text-violet-400 animate-pulse" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Gemini AI Assistant
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Preset AI Actions */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAIAction('improve')}
              disabled={isLoading || !content}
              className="flex items-center justify-center space-x-2 text-xs font-medium bg-secondary/30 hover:bg-secondary/60 border border-border/50 rounded-lg p-2.5 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-violet-400 ${isLoading && activeAction === 'improve' ? 'animate-spin' : ''}`} />
              <span>Improve Style</span>
            </button>
            <button
              onClick={() => handleAIAction('professional')}
              disabled={isLoading || !content}
              className="flex items-center justify-center space-x-2 text-xs font-medium bg-secondary/30 hover:bg-secondary/60 border border-border/50 rounded-lg p-2.5 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightLeft className={`h-3.5 w-3.5 text-blue-400 ${isLoading && activeAction === 'professional' ? 'animate-spin' : ''}`} />
              <span>Rewrite Formal</span>
            </button>
            <button
              onClick={() => handleAIAction('summary')}
              disabled={isLoading || !content}
              className="flex items-center justify-center space-x-2 text-xs font-medium bg-secondary/30 hover:bg-secondary/60 border border-border/50 rounded-lg p-2.5 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquareCode className={`h-3.5 w-3.5 text-emerald-400 ${isLoading && activeAction === 'summary' ? 'animate-spin' : ''}`} />
              <span>Summarize</span>
            </button>
            <button
              onClick={() => handleAIAction('title')}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 text-xs font-medium bg-secondary/30 hover:bg-secondary/60 border border-border/50 rounded-lg p-2.5 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`h-3.5 w-3.5 text-indigo-400 ${isLoading && activeAction === 'title' ? 'animate-spin' : ''}`} />
              <span>Suggest Title</span>
            </button>
          </div>
        </div>

        {/* Custom Prompt Box */}
        <form onSubmit={handleCustomPromptSubmit} className="space-y-2">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Custom AI Command
          </h4>
          <div className="flex items-center space-x-2 bg-secondary/40 border border-border/60 rounded-lg px-3 py-1.5 focus-within:border-violet-500/50 transition">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isLoading}
              className="bg-transparent text-xs w-full text-foreground placeholder-muted-foreground focus:outline-none"
              placeholder="e.g. Expand on next steps in table format..."
            />
            <button
              type="submit"
              disabled={isLoading || !customPrompt.trim()}
              className="text-violet-400 hover:text-violet-300 disabled:text-muted-foreground cursor-pointer transition"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* AI Output Window */}
        {(isLoading || aiOutput) && (
          <div className="border border-border/60 rounded-xl bg-slate-950/40 p-4 space-y-3.5 relative overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3 text-xs text-muted-foreground">
                <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                <span>Gemini processing document...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-[10px] text-indigo-400 uppercase tracking-widest font-semibold border-b border-border/40 pb-1.5">
                  <span>Gemini AI Suggestion</span>
                  <span className="bg-violet-500/10 text-violet-300 px-1.5 py-0.5 rounded text-[8px]">
                    Draft Ready
                  </span>
                </div>
                
                <div className="text-[11.5px] leading-relaxed text-muted-foreground max-h-[180px] overflow-y-auto font-mono whitespace-pre-wrap">
                  {aiOutput}
                </div>

                {/* Apply Suggestion CTA */}
                {activeAction !== 'title' && (
                  <button
                    onClick={applyAIPolishedContent}
                    className="flex items-center justify-center space-x-2 w-full text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg py-2 transition duration-200 cursor-pointer shadow-md shadow-indigo-600/10 mt-2"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    <span>Apply to Editor</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
