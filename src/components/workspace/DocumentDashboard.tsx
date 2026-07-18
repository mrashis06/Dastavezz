'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  FileText,
  LayoutGrid,
  Clock,
  Loader2,
  MoreHorizontal,
  SortAsc,
  AlignLeft,
  Sparkles,
  ChevronRight,
  Share2,
  Download,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { compileMarkdown } from '@/utils/markdown';
import {
  getUserDocuments,
  createDocument,
  deleteDocument,
  renameDocument,
  DBDocument
} from '@/services/documents';
import { useAuth } from '@/providers/AuthProvider';

interface DocumentDashboardProps {
  onOpenDocument: (docId: string, docData: DBDocument) => void;
}

// Deterministic color palette per document (based on title hash)
const CARD_PALETTES = [
  { from: '#6366f1', to: '#8b5cf6', text: '#c4b5fd', icon: '#a78bfa' },
  { from: '#0ea5e9', to: '#6366f1', text: '#bae6fd', icon: '#93c5fd' },
  { from: '#10b981', to: '#0ea5e9', text: '#a7f3d0', icon: '#6ee7b7' },
  { from: '#f59e0b', to: '#ef4444', text: '#fde68a', icon: '#fcd34d' },
  { from: '#ec4899', to: '#8b5cf6', text: '#fbcfe8', icon: '#f9a8d4' },
  { from: '#14b8a6', to: '#6366f1', text: '#99f6e4', icon: '#5eead4' },
  { from: '#f97316', to: '#ec4899', text: '#fed7aa', icon: '#fdba74' },
  { from: '#8b5cf6', to: '#06b6d4', text: '#ddd6fe', icon: '#c4b5fd' },
];

function getPalette(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CARD_PALETTES[hash % CARD_PALETTES.length];
}

function getWordCount(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function getLineCount(content: string) {
  return content.split('\n').filter((l) => l.trim()).length;
}

function getCleanPreview(content: string) {
  return content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 100);
}

function getDocumentTitle(content: string) {
  const headingMatch = content.match(/^#{1,3}\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : null;
}

export default function DocumentDashboard({ onOpenDocument }: DocumentDashboardProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DBDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');

  const [renameDocId, setRenameDocId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [deleteDocTitle, setDeleteDocTitle] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [newDocLoading, setNewDocLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const fetchDocs = async () => {
      const timer = setTimeout(() => { if (active) setLoading(true); }, 0);
      const docs = await getUserDocuments(user.uid);
      if (active) { setDocuments(docs); setLoading(false); clearTimeout(timer); }
    };
    fetchDocs();
    return () => { active = false; };
  }, [user]);

  const handleCreateDocument = async () => {
    if (!user) return;
    setNewDocLoading(true);
    try {
      const docId = await createDocument(user.uid, 'Untitled_Document', '# New Outline\n\nWrite here...');
      const newDoc: DBDocument = {
        id: docId,
        title: 'Untitled_Document',
        content: '# New Outline\n\nWrite here...',
        activeTemplateId: null,
        exportSettings: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: 'standard',
          customMargins: { top: 20, right: 20, bottom: 20, left: 20 },
          fontSize: 'base',
          theme: 'professional'
        }
      };
      onOpenDocument(docId, newDoc);
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setNewDocLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !deleteDocId) return;
    setDeleteLoading(true);
    try {
      await deleteDocument(user.uid, deleteDocId);
      setDocuments(documents.filter((doc) => doc.id !== deleteDocId));
      setDeleteDocId(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !renameDocId || !renameValue.trim()) return;
    setRenameLoading(true);
    try {
      await renameDocument(user.uid, renameDocId, renameValue.trim());
      setDocuments(documents.map((doc) => doc.id === renameDocId ? { ...doc, title: renameValue.trim() } : doc));
      setRenameDocId(null);
    } catch (error) {
      console.error('Error renaming document:', error);
    } finally {
      setRenameLoading(false);
    }
  };

  const formatTime = (timestamp?: { toDate?: () => Date } | Date | null) => {
    if (!timestamp) return 'Just now';
    let date: Date;
    if (timestamp instanceof Date) { date = timestamp; }
    else if (timestamp.toDate && typeof timestamp.toDate === 'function') { date = timestamp.toDate(); }
    else { date = new Date(timestamp as unknown as string); }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const [exportDoc, setExportDoc] = useState<DBDocument | null>(null);
  const [isSharingPDF, setIsSharingPDF] = useState(false);

  useEffect(() => {
    if (!exportDoc) return;
    const runExport = async () => {
      try {
        const { exportToPDF } = await import('@/utils/pdfExport');
        if (isSharingPDF) {
          const blob = await exportToPDF('pdf-dashboard-export-content', exportDoc.title, exportDoc.exportSettings, 'blob');
          if (blob) {
            const fileName = (exportDoc.title || 'Untitled_Document').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
            const fileObj = new File([blob], `${fileName}.pdf`, { type: 'application/pdf' });
            if (navigator.canShare && navigator.canShare({ files: [fileObj] })) {
              await navigator.share({
                files: [fileObj],
                title: exportDoc.title,
                text: `Shared document: ${exportDoc.title}`
              });
            } else {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `${fileName}.pdf`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              alert('Native sharing is not supported by your browser. The file has been downloaded instead.');
            }
          }
        } else {
          await exportToPDF('pdf-dashboard-export-content', exportDoc.title, exportDoc.exportSettings, 'save');
        }
      } catch (err) {
        console.error('Dashboard PDF export failed:', err);
      } finally {
        setExportDoc(null);
        setIsSharingPDF(false);
      }
    };
    const timer = setTimeout(runExport, 300);
    return () => clearTimeout(timer);
  }, [exportDoc, isSharingPDF]);

  const handleShareFile = async (doc: DBDocument, format: 'pdf' | 'docx' | 'markdown') => {
    const fileName = (doc.title || 'Untitled_Document').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      let fileBlob: Blob | undefined;
      let fileExt = '';
      let mimeType = '';

      if (format === 'markdown') {
        fileBlob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8;' });
        fileExt = 'md';
        mimeType = 'text/markdown';
      } else if (format === 'docx') {
        const { compileMarkdownToHtml } = await import('@/utils/markdown');
        const compiledHtml = compileMarkdownToHtml(doc.content);
        const theme = doc.exportSettings?.theme || 'professional';
        const fontSize = doc.exportSettings?.fontSize || 'base';
        const fontName = theme === 'minimal' ? 'Courier New' : theme === 'academic' ? 'Georgia' : 'Arial';
        const fontSizePt = fontSize === 'sm' ? '10.5pt' : fontSize === 'lg' ? '13.5pt' : '11.5pt';
        
        const docHtml = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <title>${doc.title}</title>
            <style>
              body {
                font-family: '${fontName}', 'Segoe UI', Arial, sans-serif;
                font-size: ${fontSizePt};
                line-height: 1.5;
                color: #2b2d31;
                margin: 1in;
              }
              h1 { font-size: 24pt; font-weight: bold; color: #111827; margin-top: 18pt; margin-bottom: 8pt; }
              h2 { font-size: 16pt; font-weight: bold; color: #1f2937; margin-top: 14pt; margin-bottom: 6pt; border-bottom: 1.5px solid #e5e7eb; padding-bottom: 3pt; }
              h3 { font-size: 13pt; font-weight: bold; color: #374151; margin-top: 12pt; margin-bottom: 4pt; }
              p { margin-top: 0; margin-bottom: 8pt; }
              ul, ol { margin-top: 0; margin-bottom: 8pt; padding-left: 20pt; }
              li { margin-bottom: 3pt; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 14pt; }
              th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; font-size: 10pt; }
              th { background-color: #f9fafb; font-weight: bold; color: #111827; }
              a { color: #4f46e5; text-decoration: underline; }
              hr { border: 0; border-top: 1px solid #e5e7eb; margin: 16pt 0; }
            </style>
          </head>
          <body>
            ${compiledHtml}
          </body>
          </html>
        `;
        fileBlob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8;' });
        fileExt = 'doc';
        mimeType = 'application/msword';
      }

      if (fileBlob) {
        const fileObj = new File([fileBlob], `${fileName}.${fileExt}`, { type: mimeType });
        if (navigator.canShare && navigator.canShare({ files: [fileObj] })) {
          await navigator.share({
            files: [fileObj],
            title: doc.title,
            text: `Shared document: ${doc.title}`
          });
        } else {
          const url = URL.createObjectURL(fileBlob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${fileName}.${fileExt}`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert('Native sharing is not supported by your browser. The file has been downloaded instead.');
        }
      }
    } catch (e) {
      console.error('Sharing file failed', e);
    }
  };

  const handleDownload = async (doc: DBDocument, format: 'docx' | 'markdown') => {
    const fileName = (doc.title || 'Untitled_Document').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    if (format === 'markdown') {
      const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const { compileMarkdownToHtml } = await import('@/utils/markdown');
      const compiledHtml = compileMarkdownToHtml(doc.content);
      
      const theme = doc.exportSettings?.theme || 'professional';
      const fontSize = doc.exportSettings?.fontSize || 'base';
      const fontName = theme === 'minimal' ? 'Courier New' : theme === 'academic' ? 'Georgia' : 'Arial';
      const fontSizePt = fontSize === 'sm' ? '10.5pt' : fontSize === 'lg' ? '13.5pt' : '11.5pt';
      
      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>${doc.title}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            body {
              font-family: '${fontName}', 'Segoe UI', Arial, sans-serif;
              font-size: ${fontSizePt};
              line-height: 1.5;
              color: #2b2d31;
              margin: 1in;
            }
            h1 { font-size: 24pt; font-weight: bold; color: #111827; margin-top: 18pt; margin-bottom: 8pt; }
            h2 { font-size: 16pt; font-weight: bold; color: #1f2937; margin-top: 14pt; margin-bottom: 6pt; border-bottom: 1.5px solid #e5e7eb; padding-bottom: 3pt; }
            h3 { font-size: 13pt; font-weight: bold; color: #374151; margin-top: 12pt; margin-bottom: 4pt; }
            p { margin-top: 0; margin-bottom: 8pt; }
            ul, ol { margin-top: 0; margin-bottom: 8pt; padding-left: 20pt; }
            li { margin-bottom: 3pt; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 14pt; }
            th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; font-size: 10pt; }
            th { background-color: #f9fafb; font-weight: bold; color: #111827; }
            a { color: #4f46e5; text-decoration: underline; }
            hr { border: 0; border-top: 1px solid #e5e7eb; margin: 16pt 0; }
          </style>
        </head>
        <body>
          ${compiledHtml}
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = (doc: DBDocument, platform: 'whatsapp' | 'gmail' | 'telegram' | 'link') => {
    const docUrl = `${window.location.origin}/workspace/${doc.id}`;
    const text = `Check out this document I created on Dastavezz: "${doc.title}"\nLink: ${docUrl}`;
    
    if (platform === 'link') {
      navigator.clipboard.writeText(docUrl);
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'gmail') {
      window.open(`mailto:?subject=${encodeURIComponent(doc.title)}&body=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(docUrl)}&text=${encodeURIComponent(`Check out this document: "${doc.title}"`)}`, '_blank');
    }
  };

  const filteredDocs = documents
    .filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      const timeA = a.updatedAt?.seconds ?? 0;
      const timeB = b.updatedAt?.seconds ?? 0;
      return timeB - timeA;
    });

  return (
    <div className="min-h-screen select-none bg-slate-50 dark:bg-[#0a0a0c]">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-200/70 dark:border-white/[0.06] bg-white dark:bg-[#111114]">
        {/* Decorative gradient blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

        <div className="max-w-[1200px] mx-auto px-6 py-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-5 w-5 rounded-md flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">My Documents</h1>
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium pl-7">
                {loading
                  ? 'Loading your workspace…'
                  : `${documents.length} document${documents.length !== 1 ? 's' : ''} · auto-synced`}
              </p>
            </div>

            <button
              onClick={handleCreateDocument}
              disabled={newDocLoading}
              className="group flex items-center space-x-2.5 h-10 px-5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-px active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' }}
            >
              {newDocLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />}
              <span>New Document</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-7 space-y-6">

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">

          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search documents…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 pr-4 text-sm bg-white dark:bg-[#111114] border-slate-200 dark:border-white/[0.08] rounded-xl shadow-sm focus-visible:ring-violet-500/20 focus-visible:border-violet-400 dark:focus-visible:border-violet-400/50 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.07] rounded-xl shadow-sm p-0.5">
              <button
                onClick={() => setSortBy('updated')}
                className={`flex items-center space-x-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${sortBy === 'updated'
                    ? 'text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                style={sortBy === 'updated' ? { background: 'linear-gradient(135deg, #7c3aed, #6366f1)' } : {}}
              >
                <Clock className="h-3 w-3" />
                <span>Recent</span>
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`flex items-center space-x-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${sortBy === 'title'
                    ? 'text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                style={sortBy === 'title' ? { background: 'linear-gradient(135deg, #7c3aed, #6366f1)' } : {}}
              >
                <SortAsc className="h-3 w-3" />
                <span>Name</span>
              </button>
            </div>

            <div className="flex bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/[0.07] rounded-xl shadow-sm p-0.5 gap-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-150 cursor-pointer ${viewMode === 'grid' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350'}`}
                style={viewMode === 'grid' ? { background: 'linear-gradient(135deg, #7c3aed, #6366f1)' } : {}}
                title="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-150 cursor-pointer ${viewMode === 'list' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350'}`}
                style={viewMode === 'list' ? { background: 'linear-gradient(135deg, #7c3aed, #6366f1)' } : {}}
                title="List view"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Document area ────────────────────────────────────────────────── */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`animate-pulse rounded-2xl bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.07] shadow-sm ${viewMode === 'grid' ? 'h-52' : 'h-16'}`} />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (

          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-500/20"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' }}>
                <FileText className="h-9 w-9 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-violet-100 flex items-center justify-center shadow-sm">
                <Sparkles className="h-3 w-3 text-violet-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {searchQuery ? 'No results found' : 'Your workspace is empty'}
            </h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-8">
              {searchQuery
                ? `No documents match "${searchQuery}".`
                : 'Create your first document and start writing with AI-powered assistance.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateDocument}
                disabled={newDocLoading}
                className="flex items-center space-x-2 h-10 px-6 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-60 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-px"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' }}
              >
                {newDocLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Create first document</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (

          /* ── Grid view ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => {
              const palette = getPalette(doc.id);
              const headingTitle = getDocumentTitle(doc.content);
              const preview = getCleanPreview(doc.content);
              const words = getWordCount(doc.content);
              const lines = getLineCount(doc.content);

              return (
                <div
                  key={doc.id}
                  onClick={() => onOpenDocument(doc.id, doc)}
                  className="group relative bg-white dark:bg-[#18181d] border border-slate-200/80 dark:border-white/[0.07] shadow-sm hover:shadow-xl dark:hover:shadow-black/30 hover:shadow-slate-900/[0.08] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                >
                  {/* ── Gradient thumbnail ── */}
                  <div
                    className="relative flex-none h-36 flex flex-col justify-between p-5 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)` }}
                  >
                    {/* Decorative pattern overlay */}
                    <div className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
                          radial-gradient(circle at 20% 80%, white 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                      }} />

                    {/* Top row: icon + menu */}
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <FileText className="h-4.5 w-4.5 text-white" />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-150 opacity-0 group-hover:opacity-100 cursor-pointer outline-none border-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-52 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181d] shadow-xl shadow-black/10 p-1"
                        >
                          <DropdownMenuItem
                            className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                            onClick={(e) => { e.stopPropagation(); onOpenDocument(doc.id, doc); }}
                          >
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            <span>Open document</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                            onClick={(e) => { e.stopPropagation(); setRenameDocId(doc.id); setRenameValue(doc.title); }}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>Rename</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/[0.06]" />

                          {/* Download submenu */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger
                              className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-3.5 w-3.5 text-slate-400" />
                              <span>Download as...</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-36 bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.08]">
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); setExportDoc(doc); }}
                              >
                                PDF (.pdf)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleDownload(doc, 'docx'); }}
                              >
                                Word (.doc)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleDownload(doc, 'markdown'); }}
                              >
                                Markdown (.md)
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          {/* Share File submenu */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger
                              className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Share2 className="h-3.5 w-3.5 text-slate-400" />
                              <span>Share as File...</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-40 bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.08]">
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); setIsSharingPDF(true); setExportDoc(doc); }}
                              >
                                PDF (.pdf)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShareFile(doc, 'docx'); }}
                              >
                                Word (.doc)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShareFile(doc, 'markdown'); }}
                              >
                                Markdown (.md)
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          {/* Share Link submenu */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger
                              className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Send className="h-3.5 w-3.5 text-slate-400" />
                              <span>Share Link...</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-36 bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.08]">
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-55 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShare(doc, 'whatsapp'); }}
                              >
                                WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-55 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShare(doc, 'gmail'); }}
                              >
                                Gmail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-55 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShare(doc, 'telegram'); }}
                              >
                                Telegram
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/[0.06]" />
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-55 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShare(doc, 'link'); }}
                              >
                                Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/[0.06]" />
                          
                          <DropdownMenuItem
                            className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-red-550 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-650"
                            onClick={(e) => { e.stopPropagation(); setDeleteDocId(doc.id); setDeleteDocTitle(doc.title); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Document mini-preview lines */}
                    <div className="relative z-10 space-y-1">
                      <div className="h-2 rounded-full bg-white/40 w-3/4" />
                      <div className="h-1.5 rounded-full bg-white/25 w-full" />
                      <div className="h-1.5 rounded-full bg-white/25 w-5/6" />
                      <div className="h-1.5 rounded-full bg-white/20 w-2/3" />
                    </div>
                  </div>

                  {/* ── Card body ── */}
                  <div className="flex flex-col flex-1 p-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-1.5">
                      {doc.title.replace(/_/g, ' ')}
                    </h4>
                    {headingTitle && headingTitle !== doc.title.replace(/_/g, ' ') && (
                      <p className="text-[10px] font-medium text-slate-400 mb-1 truncate">{headingTitle}</p>
                    )}
                    {preview && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">{preview}</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(doc.updatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-300 font-medium">
                        <span>{words}w</span>
                        <span>·</span>
                        <span>{lines}L</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover CTA overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-b-2xl"
                    style={{ background: `linear-gradient(to top, ${palette.from}18, transparent)` }}>
                  </div>
                </div>
              );
            })}

            {/* Create new card */}
            <button
              onClick={handleCreateDocument}
              disabled={newDocLoading}
              className="group relative bg-white/40 dark:bg-white/[0.02] rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.08] hover:border-violet-300 dark:hover:border-violet-500/50 hover:bg-white dark:hover:bg-[#18181d] hover:shadow-lg hover:shadow-violet-500/10 dark:hover:shadow-black/20 h-52 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.06] group-hover:bg-violet-50 dark:group-hover:bg-violet-500/10 transition-colors duration-300 mb-3">
                {newDocLoading
                  ? <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                  : <Plus className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors duration-300 group-hover:rotate-90 transition-transform" />}
              </div>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-violet-600 transition-colors duration-300">New document</span>
            </button>
          </div>
        ) : (

          /* ── List view ── */
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#18181d] shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.05]">
            {filteredDocs.map((doc) => {
              const palette = getPalette(doc.id);
              const preview = getCleanPreview(doc.content);
              const words = getWordCount(doc.content);

              return (
                <div
                  key={doc.id}
                  onClick={() => onOpenDocument(doc.id, doc)}
                  className="group flex items-center justify-between px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    {/* Color dot */}
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
                    >
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{doc.title.replace(/_/g, ' ')}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">{preview || 'Empty document'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0 ml-4">
                    <div className="hidden sm:flex items-center space-x-3 text-[10px] text-slate-400 font-medium">
                      <span>{words}w</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(doc.updatedAt)}</span>
                      </span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors duration-150 cursor-pointer outline-none border-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-52 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181d] shadow-xl shadow-black/10 p-1"
                        >
                          <DropdownMenuItem
                            className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                            onClick={(e) => { e.stopPropagation(); onOpenDocument(doc.id, doc); }}
                          >
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            <span>Open document</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                            onClick={(e) => { e.stopPropagation(); setRenameDocId(doc.id); setRenameValue(doc.title); }}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>Rename</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/[0.06]" />

                          {/* Download submenu */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger
                              className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-3.5 w-3.5 text-slate-400" />
                              <span>Download as...</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-36 bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.08]">
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); setExportDoc(doc); }}
                              >
                                PDF (.pdf)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-lg cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleDownload(doc, 'docx'); }}
                              >
                                Word (.doc)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleDownload(doc, 'markdown'); }}
                              >
                                Markdown (.md)
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          {/* Share submenu */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger
                              className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Share2 className="h-3.5 w-3.5 text-slate-400" />
                              <span>Share via...</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-36 bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.08]">
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShare(doc, 'whatsapp'); }}
                              >
                                WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShare(doc, 'gmail'); }}
                              >
                                Gmail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShare(doc, 'telegram'); }}
                              >
                                Telegram
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/[0.06]" />
                              <DropdownMenuItem
                                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                                onClick={(e) => { e.stopPropagation(); handleShare(doc, 'link'); }}
                              >
                                Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/[0.06]" />
                          
                          <DropdownMenuItem
                            className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-red-550 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-650"
                            onClick={(e) => { e.stopPropagation(); setDeleteDocId(doc.id); setDeleteDocTitle(doc.title); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* List footer: add new */}
            <button
              onClick={handleCreateDocument}
              disabled={newDocLoading}
              className="group flex items-center space-x-4 px-5 py-4 w-full hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-150 cursor-pointer disabled:opacity-50"
            >
              <div className="h-9 w-9 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/[0.08] group-hover:border-violet-300 dark:group-hover:border-violet-500/50 flex items-center justify-center shrink-0 transition-colors duration-200">
                {newDocLoading ? <Loader2 className="h-4 w-4 animate-spin text-violet-400" /> : <Plus className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />}
              </div>
              <span className="text-sm font-medium text-slate-400 group-hover:text-violet-600 transition-colors duration-200">New document</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Rename Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={renameDocId !== null} onOpenChange={(open) => !open && setRenameDocId(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6 bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.08] shadow-2xl dark:shadow-black/60 text-slate-900 dark:text-white">
          <form onSubmit={handleRename}>
            <DialogHeader className="pb-4">
              <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white">Rename document</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">Enter a new title for this document.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                disabled={renameLoading}
                className="h-9 text-sm bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 rounded-xl focus-visible:ring-violet-500/20"
                required
              />
            </div>
            <DialogFooter className="pt-4 mt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRenameDocId(null)} disabled={renameLoading} className="h-8 text-xs font-semibold cursor-pointer rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={renameLoading || !renameValue.trim()}
                className="h-8 px-4 text-xs font-semibold cursor-pointer rounded-xl text-white border-0 shadow-none"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
              >
                {renameLoading && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={deleteDocId !== null} onOpenChange={(open) => !open && setDeleteDocId(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6 bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.08] shadow-2xl dark:shadow-black/60 text-slate-900 dark:text-white">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white">Delete document?</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-slate-300">&ldquo;{deleteDocTitle}&rdquo;</span> will be permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDeleteDocId(null)} disabled={deleteLoading} className="h-8 text-xs font-semibold cursor-pointer rounded-xl">
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} disabled={deleteLoading} className="h-8 px-4 text-xs font-semibold cursor-pointer rounded-xl bg-red-600 hover:bg-red-500 text-white border-0 shadow-none">
              {deleteLoading && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden PDF render layer for dashboard direct export */}
      {exportDoc && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none', userSelect: 'none' }}>
          <div
            id="pdf-dashboard-export-content"
            style={{
              width: exportDoc.exportSettings?.orientation === 'landscape' ? '1123px' : '794px',
              minHeight: exportDoc.exportSettings?.orientation === 'landscape' ? '794px' : '1123px'
            }}
            className="a4-sheet bg-white text-black p-12"
          >
            <div className="prose max-w-none break-words">
              {compileMarkdown(exportDoc.content)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
