'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Loader2,
  RotateCcw,
  Copy,
  Eye,
  Wand2,
  FileEdit,
  LayoutTemplate,
  Type,
  Download,
  Pencil,
  CheckCircle2
} from 'lucide-react';
import { getDocumentVersions, createDocument } from '@/services/documents';
import { useAuth } from '@/providers/AuthProvider';
import { DocumentVersion } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface VersionHistoryProps {
  documentId: string;
  onRestore: (title: string, content: string) => Promise<void>;
}

// Returns label + color style + icon for each action category
function getActionMeta(action: string): { label: string; icon: React.ReactNode; badgeClass: string } {
  const lower = action.toLowerCase();
  if (lower.includes('ai') || lower.includes('improve') || lower.includes('rewrite') || lower.includes('summarize') || lower.includes('title')) {
    return {
      label: 'AI Action',
      icon: <Wand2 className="h-2.5 w-2.5" />,
      badgeClass: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-900/50'
    };
  }
  if (lower.includes('template')) {
    return {
      label: 'Template',
      icon: <LayoutTemplate className="h-2.5 w-2.5" />,
      badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50'
    };
  }
  if (lower.includes('title')) {
    return {
      label: 'Title Edit',
      icon: <Type className="h-2.5 w-2.5" />,
      badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
    };
  }
  if (lower.includes('restore') || lower.includes('checkpoint')) {
    return {
      label: 'Restored',
      icon: <RotateCcw className="h-2.5 w-2.5" />,
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
    };
  }
  if (lower.includes('export')) {
    return {
      label: 'Export',
      icon: <Download className="h-2.5 w-2.5" />,
      badgeClass: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/50'
    };
  }
  if (lower.includes('auto')) {
    return {
      label: 'Auto Save',
      icon: <CheckCircle2 className="h-2.5 w-2.5" />,
      badgeClass: 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.07]'
    };
  }
  return {
    label: 'Manual Edit',
    icon: <Pencil className="h-2.5 w-2.5" />,
    badgeClass: 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.07]'
  };
}

// Group versions by date (Today / Yesterday / older date strings)
function groupVersionsByDate(versions: DocumentVersion[]): Map<string, DocumentVersion[]> {
  const map = new Map<string, DocumentVersion[]>();
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toDateString();

  versions.forEach((ver) => {
    const date = ver.timestamp ? ver.timestamp.toDate() : new Date();
    const ds = date.toDateString();
    let group: string;
    if (ds === todayStr) group = 'Today';
    else if (ds === yesterdayStr) group = 'Yesterday';
    else group = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(ver);
  });
  return map;
}

export default function VersionHistory({ documentId, onRestore }: VersionHistoryProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getDocumentVersions(user.uid, documentId);
      setVersions(data);
    } catch (err) {
      console.error('Failed to load version history:', err);
      setError('Failed to load version snapshots.');
    } finally {
      setLoading(false);
    }
  }, [user, documentId]);

  useEffect(() => {
    let cancelled = false;
    const uid = user?.uid;
    if (!uid) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDocumentVersions(uid, documentId);
        if (!cancelled) setVersions(data);
      } catch (err) {
        console.error('Failed to load version history:', err);
        if (!cancelled) setError('Failed to load version snapshots.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user, documentId, fetchVersions]);

  const handleRestoreClick = async (version: DocumentVersion) => {
    if (!user) return;
    try {
      setActionLoadingId(version.id);
      await onRestore(version.title, version.content);
      await fetchVersions();
    } catch (err) {
      console.error('Restore version failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDuplicateClick = async (version: DocumentVersion) => {
    if (!user) return;
    try {
      setActionLoadingId(version.id);
      const newDocId = await createDocument(user.uid, `${version.title} (Copy)`, version.content);
      router.push(`/workspace/${newDocId}`);
    } catch (err) {
      console.error('Duplicate version failed:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Just now';
    return timestamp.toDate().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const grouped = groupVersionsByDate(versions);

  return (
    <div className="flex flex-col bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.07] rounded-2xl overflow-hidden h-full shadow-sm dark:shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-white dark:text-slate-900" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight leading-none">Version History</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Snapshots &amp; restore points</p>
          </div>
        </div>
        {!loading && versions.length > 0 && (
          <span className="text-[9px] bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-slate-400 font-bold px-2 py-1 rounded-full border border-slate-200 dark:border-white/[0.08] select-none">
            {versions.length} snapshot{versions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Timeline Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 select-none">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-foreground">Loading snapshots</p>
              <p className="text-[10px] text-muted-foreground">Fetching version history…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2 select-none">
            <p className="text-xs font-semibold text-red-500">{error}</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center select-none">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
              <FileEdit className="h-6 w-6 text-slate-300 dark:text-slate-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">No snapshots yet</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px] mx-auto">
                Snapshots are created automatically as you edit, apply AI actions, or select templates.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {[...grouped.entries()].map(([group, groupVersions]) => (
              <div key={group}>
                {/* Date Group Heading */}
                <div className="flex items-center space-x-2 mb-3 select-none">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">{group}</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
                </div>

                {/* Version Cards */}
                <div className="space-y-2 relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-3 bottom-3 w-px bg-slate-200 dark:bg-white/[0.06]" />

                  {groupVersions.map((ver) => {
                    const meta = getActionMeta(ver.action);
                    const isActing = actionLoadingId === ver.id;
                    return (
                      <div
                        key={ver.id}
                        className="group relative flex pl-8 w-full"
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-1.5 top-3.5 h-3 w-3 rounded-full bg-white dark:bg-[#18181d] border-2 border-slate-300 dark:border-slate-600 shrink-0 z-10 group-hover:border-violet-400 dark:group-hover:border-violet-500 transition" />

                        {/* Card */}
                        <div className="flex-1 min-w-0 overflow-hidden rounded-xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:border-slate-200 dark:hover:border-white/[0.1] hover:shadow-sm dark:hover:shadow-black/30 transition-all duration-200 p-3.5">
                          {/* Card top row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground truncate leading-snug" title={ver.title}>
                                {ver.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{formatTime(ver.timestamp)}</p>
                            </div>
                            <span className={`flex items-center space-x-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 select-none ${meta.badgeClass}`}>
                              {meta.icon}
                              <span>{meta.label}</span>
                            </span>
                          </div>

                          {/* Content snippet */}
                          {ver.previewSnippet && (
                            <p className="text-[10px] text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed font-mono bg-slate-50 dark:bg-white/[0.04] rounded-lg px-2.5 py-2 border border-slate-100 dark:border-white/[0.06]">
                              {ver.previewSnippet}
                            </p>
                          )}

                          {/* Actions — always visible, wrap if needed */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewVersion(ver)}
                              disabled={isActing}
                              className="h-6 text-[10px] px-2 font-semibold cursor-pointer rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07]"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreClick(ver)}
                              disabled={isActing}
                              className="h-6 text-[10px] px-2 font-semibold cursor-pointer rounded-lg text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                            >
                              {isActing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                              Restore
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateClick(ver)}
                              disabled={isActing}
                              className="h-6 text-[10px] px-2 font-semibold cursor-pointer rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.07]"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Duplicate
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewVersion && (
        <Dialog open={true} onOpenChange={() => setPreviewVersion(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-white/[0.09] rounded-2xl shadow-2xl dark:shadow-black/60">
            <DialogHeader className="border-b border-slate-100 dark:border-white/[0.07] pb-4">
              <DialogTitle className="text-base font-bold text-foreground flex items-center space-x-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Version Preview</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{previewVersion.title}</span>
                &nbsp;·&nbsp;{previewVersion.action}
                &nbsp;·&nbsp;{previewVersion.timestamp ? previewVersion.timestamp.toDate().toLocaleString() : 'Unknown time'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-[#111114] rounded-xl m-2 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-300 max-h-[420px] border border-slate-200 dark:border-white/[0.07]">
              {previewVersion.content || '*No content in this snapshot*'}
            </div>
            <DialogFooter className="border-t border-slate-100 dark:border-white/[0.07] pt-4 flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewVersion(null)}
                className="h-9 text-xs font-semibold cursor-pointer rounded-xl"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleRestoreClick(previewVersion);
                  setPreviewVersion(null);
                }}
                className="h-9 text-xs font-bold cursor-pointer rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-violet-600 dark:hover:bg-violet-700 text-white shadow"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Restore this version
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
