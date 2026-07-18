'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Settings, HelpCircle, BookOpen } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import TemplateSelector from '@/components/workspace/TemplateSelector';
import DocumentEditor from '@/components/workspace/DocumentEditor';
import LivePreview from '@/components/workspace/LivePreview';
import AIAssistant from '@/components/workspace/AIAssistant';
import ExportControls from '@/components/workspace/ExportControls';
import { DocumentTemplate, ExportSettings } from '@/types';
import { templates } from '@/templates';

export default function WorkspaceHome() {
  // Document state
  const [title, setTitle] = useState('My_Resume');
  const [content, setContent] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  
  // Exporter layout state
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    pageSize: 'A4',
    margins: 'standard',
    fontSize: 'base',
    theme: 'professional',
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'export'>('ai');

  // Load the default resume template on mount
  useEffect(() => {
    const resume = templates.find((t) => t.id === 'resume');
    if (resume) {
      setContent(resume.content);
      setTitle(resume.defaultTitle);
      setActiveTemplateId(resume.id);
    }
  }, []);

  // Firebase Auto-save Simulation
  useEffect(() => {
    if (!content) return;
    setIsSaving(true);
    const saveTimer = setTimeout(() => {
      setIsSaving(false);
    }, 850);

    return () => clearTimeout(saveTimer);
  }, [content, title]);

  // Handle template insertion
  const handleSelectTemplate = useCallback((template: DocumentTemplate) => {
    setContent(template.content);
    setTitle(template.defaultTitle);
    setActiveTemplateId(template.id);
  }, []);

  // Handle document resetting
  const handleResetWorkspace = useCallback(() => {
    setContent('');
    setTitle('Untitled_Document');
    setActiveTemplateId(null);
  }, []);

  // Text metrics helpers
  const getWordCount = () => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  };

  const getCharCount = () => {
    return content.length;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* 1. Global Navigation Bar */}
      <Navbar
        title={title}
        onTitleChange={setTitle}
        onReset={handleResetWorkspace}
        isSaving={isSaving}
      />

      {/* 2. Top Section Template Gallery Selector */}
      <TemplateSelector
        onSelectTemplate={handleSelectTemplate}
        activeTemplateId={activeTemplateId}
      />

      {/* 3. Main Split Work Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-6 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
          
          {/* Column 1: Document Editor Pane (Span 5) */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <DocumentEditor
              content={content}
              onContentChange={setContent}
              wordCount={getWordCount()}
              charCount={getCharCount()}
            />
          </div>

          {/* Column 2: Live Document Preview (Span 4) */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <LivePreview
              content={content}
              title={title}
              settings={exportSettings}
            />
          </div>

          {/* Column 3: Tabbed Panel holding AI Assistant & Exporter Controls (Span 3) */}
          <div className="lg:col-span-3 flex flex-col h-full space-y-4">
            
            {/* Control Column Tabs */}
            <div className="flex bg-secondary/30 rounded-lg p-1 border border-border/40 shrink-0">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 flex items-center justify-center space-x-2 text-xs font-semibold py-2 rounded-md transition duration-200 cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gemini AI</span>
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`flex-1 flex items-center justify-center space-x-2 text-xs font-semibold py-2 rounded-md transition duration-200 cursor-pointer ${
                  activeTab === 'export'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Page Layout & Export</span>
              </button>
            </div>

            {/* Tab Body Node */}
            <div className="flex-1 min-h-[350px]">
              {activeTab === 'ai' ? (
                <AIAssistant
                  content={content}
                  onContentChange={setContent}
                  onTitleChange={setTitle}
                />
              ) : (
                <ExportControls
                  settings={exportSettings}
                  onSettingsChange={setExportSettings}
                  documentTitle={title}
                  documentContent={content}
                />
              )}
            </div>

            {/* Assessment Branding Card */}
            <div className="rounded-xl border border-border/60 bg-card/20 p-4 shrink-0 flex items-start space-x-3">
              <BookOpen className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  GDGoC assessment
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  Dastavezz utilizes AI formatting heuristics matching templates to export standard PDF/DOCX layouts cleanly.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
