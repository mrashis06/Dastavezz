'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Settings,
  AlertCircle,
  ArrowLeft,
  Clock,
  FileText,
  Eye
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import TemplateSelector from '@/components/workspace/TemplateSelector';
import DocumentEditor from '@/components/workspace/DocumentEditor';
import LivePreview from '@/components/workspace/LivePreview';
import AIAssistant from '@/components/workspace/AIAssistant';
import ExportControls from '@/components/workspace/ExportControls';
import VersionHistory from '@/components/workspace/VersionHistory';
import { DocumentTemplate, ExportSettings } from '@/types';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { db } from '@/services/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection } from 'firebase/firestore';
import { createDocumentVersion, CollaboratorPresence, updateUserPresence, removeUserPresence } from '@/services/documents';
import { compileMarkdown } from '@/utils/markdown';
import BrandLoader from '@/components/brand/BrandLoader';
import DastavezzIcon from '@/components/brand/DastavezzIcon';
import TemplateComparison from '@/components/template/TemplateComparison';
import { transformDocumentWithTemplate } from '@/lib/templates/templateEngine';
import { toast } from '@/utils/toast';

// ---------------------------------------------------------------------------
// Undo/Redo history entry shape
// ---------------------------------------------------------------------------
interface HistoryEntry {
  title: string;
  content: string;
}

// How long of inactivity triggers a new undo checkpoint for typing (ms)
const UNDO_TYPING_DEBOUNCE = 1000;

export default function WorkspaceDocumentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const documentId = params.documentId as string;

  const searchParams = useSearchParams();
  const ownerUidParam = searchParams.get('owner');
  const roleParam = searchParams.get('role');
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer'>('owner');

  // Determine user role (owner, guest editor, or guest viewer)
  useEffect(() => {
    if (loading || !user) return;
    if (!ownerUidParam || ownerUidParam === user.uid) {
      setUserRole('owner');
    } else {
      setUserRole(roleParam === 'editor' ? 'editor' : 'viewer');
    }
  }, [user, loading, ownerUidParam, roleParam]);

  // ---------------------------------------------------------------------------
  // Document state
  // ---------------------------------------------------------------------------
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');

  // Exporter layout state
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    margins: 'standard',
    customMargins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    fontSize: 'base',
    theme: 'professional',
  });

  // ---------------------------------------------------------------------------
  // UI state
  // ---------------------------------------------------------------------------
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'export' | 'history'>('ai');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'ai' | 'history'>('editor');
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [docLoading, setDocLoading] = useState(true);
  const [docExists, setDocExists] = useState(true);
  // Tracks if version history panel needs to refresh
  const [versionRefreshKey, setVersionRefreshKey] = useState(0);
  const [activeCollaborators, setActiveCollaborators] = useState<CollaboratorPresence[]>([]);

  // ---------------------------------------------------------------------------
  // Undo / Redo stack
  // Past entries: states that can be undone back to
  // Future entries: states that can be redone forward to
  // ---------------------------------------------------------------------------
  const pastRef = useRef<HistoryEntry[]>([]);
  const futureRef = useRef<HistoryEntry[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Debounce timer ref for grouping rapid keystrokes
  const undoDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Snapshot of what the content/title was at the start of the current typing group
  const pendingUndoEntry = useRef<HistoryEntry | null>(null);

  // Update available-stack indicators after any change
  const syncUndoRedoState = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  // Push a snapshot to the undo stack (called before a meaningful change)
  const pushUndo = useCallback((entry: HistoryEntry) => {
    pastRef.current = [...pastRef.current, entry];
    futureRef.current = []; // clear redo branch
    syncUndoRedoState();
  }, [syncUndoRedoState]);

  // ---------------------------------------------------------------------------
  // Content change handler – groups rapid keystrokes into single undo entries
  // ---------------------------------------------------------------------------
  const handleContentChange = useCallback((newContent: string) => {
    // If no pending entry exists, snapshot the current state before first keystroke
    if (!pendingUndoEntry.current) {
      pendingUndoEntry.current = { title, content };
    }

    // Reset the debounce timer
    if (undoDebounceTimer.current) {
      clearTimeout(undoDebounceTimer.current);
    }

    // After the inactivity window, commit the snapshot as a single undo entry
    undoDebounceTimer.current = setTimeout(() => {
      if (pendingUndoEntry.current) {
        pushUndo(pendingUndoEntry.current);
        pendingUndoEntry.current = null;
      }
    }, UNDO_TYPING_DEBOUNCE);

    setContent(newContent);
    futureRef.current = [];
    syncUndoRedoState();
  }, [title, content, pushUndo, syncUndoRedoState]);

  // ---------------------------------------------------------------------------
  // Title change handler – each title edit is its own undo step
  // ---------------------------------------------------------------------------
  const handleTitleChange = useCallback((newTitle: string) => {
    // Flush any pending typing group first
    if (undoDebounceTimer.current) {
      clearTimeout(undoDebounceTimer.current);
      undoDebounceTimer.current = null;
    }
    if (pendingUndoEntry.current) {
      pushUndo(pendingUndoEntry.current);
      pendingUndoEntry.current = null;
    }
    pushUndo({ title, content });
    setTitle(newTitle);
  }, [title, content, pushUndo]);

  // ---------------------------------------------------------------------------
  // Undo
  // ---------------------------------------------------------------------------
  const handleUndo = useCallback(() => {
    // Flush pending typing group
    if (undoDebounceTimer.current) {
      clearTimeout(undoDebounceTimer.current);
      undoDebounceTimer.current = null;
    }
    if (pendingUndoEntry.current) {
      pushUndo(pendingUndoEntry.current);
      pendingUndoEntry.current = null;
    }

    if (pastRef.current.length === 0) return;

    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [{ title, content }, ...futureRef.current];

    setTitle(previous.title);
    setContent(previous.content);
    syncUndoRedoState();
  }, [title, content, pushUndo, syncUndoRedoState]);

  // ---------------------------------------------------------------------------
  // Redo
  // ---------------------------------------------------------------------------
  const handleRedo = useCallback(() => {
    if (futureRef.current.length === 0) return;

    const next = futureRef.current[0];
    futureRef.current = futureRef.current.slice(1);
    pastRef.current = [...pastRef.current, { title, content }];

    setTitle(next.title);
    setContent(next.content);
    syncUndoRedoState();
  }, [title, content, syncUndoRedoState]);

  // ---------------------------------------------------------------------------
  // Global keyboard shortcut listener (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // ---------------------------------------------------------------------------
  // Redirect if not authenticated
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // ---------------------------------------------------------------------------
  // Real-time Collaborative Presence & Heartbeat Tracking
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (loading || !user || !documentId) return;

    const targetOwnerUid = ownerUidParam || user.uid;
    const presenceColRef = collection(db, 'users', targetOwnerUid, 'documents', documentId, 'presence');

    const displayName = user.displayName || user.email?.split('@')[0] || 'Collaborator';
    const photoURL = user.photoURL || null;
    const role = userRole;

    // 1. Initial presence write
    updateUserPresence(targetOwnerUid, documentId, user.uid, { displayName, photoURL, role });

    // 2. Set up heartbeat interval every 25 seconds
    const heartbeatTimer = setInterval(() => {
      updateUserPresence(targetOwnerUid, documentId, user.uid, { displayName, photoURL, role });
    }, 25000);

    // 3. Set up onSnapshot listener to keep track of active collaborators
    const unsubscribe = onSnapshot(presenceColRef, (snapshot) => {
      const collaborators: CollaboratorPresence[] = [];
      const nowMs = Date.now();

      snapshot.forEach((snap) => {
        const data = snap.data();
        // Ignore self in the display list
        if (snap.id === user.uid) return;

        // Check if lastActive timestamp is within the last 10 minutes
        const lastActive = data.lastActive;
        let isActive = false;
        if (lastActive) {
          const lastActiveMs = lastActive.toMillis ? lastActive.toMillis() : (lastActive.seconds * 1000);
          if (nowMs - lastActiveMs < 600000) {
            isActive = true;
          }
        } else {
          // If null (local write in progress), assume active
          isActive = true;
        }

        if (isActive) {
          collaborators.push({
            userId: data.userId ?? snap.id,
            displayName: data.displayName ?? 'Anonymous',
            photoURL: data.photoURL ?? null,
            role: data.role ?? 'viewer',
            lastActive: lastActive
          });
        }
      });

      setActiveCollaborators(collaborators);
    }, (error) => {
      console.error("Error subscribing to presence subcollection:", error);
    });

    // 3.5 Bind unload listeners for window close, app exit, or swipe away
    const handleUnload = () => {
      removeUserPresence(targetOwnerUid, documentId, user.uid);
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // 4. Cleanup presence record on exit
    return () => {
      clearInterval(heartbeatTimer);
      unsubscribe();
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      removeUserPresence(targetOwnerUid, documentId, user.uid);
    };
  }, [user, loading, documentId, ownerUidParam, userRole]);

  // ---------------------------------------------------------------------------
  // Load document from Firestore (Real-time listener)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (loading || !user || !documentId) return;

    const startTime = Date.now();
    const targetOwnerUid = ownerUidParam || user.uid;
    const docRef = doc(db, 'users', targetOwnerUid, 'documents', documentId);

    let isFirstLoad = true;

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Only update local state if:
        // 1. It is the first load, OR
        // 2. The edit was made by a different user to prevent cursor jumping
        if (isFirstLoad || data.lastUpdatedBy !== user.uid) {
          setTitle(data.title ?? 'Untitled_Document');
          setContent(data.content ?? '');
          setActiveTemplateId(data.activeTemplateId ?? null);
          if (data.exportSettings) {
            setExportSettings({
              pageSize: data.exportSettings.pageSize ?? 'A4',
              orientation: data.exportSettings.orientation ?? 'portrait',
              margins: data.exportSettings.margins ?? 'standard',
              customMargins: {
                top: data.exportSettings.customMargins?.top ?? 20,
                right: data.exportSettings.customMargins?.right ?? 20,
                bottom: data.exportSettings.customMargins?.bottom ?? 20,
                left: data.exportSettings.customMargins?.left ?? 20,
              },
              fontSize: data.exportSettings.fontSize ?? 'base',
              theme: data.exportSettings.theme ?? 'professional',
            });
          }
        }
        setDocExists(true);
      } else {
        setDocExists(false);
      }

      if (isFirstLoad) {
        isFirstLoad = false;
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 2000 - elapsed);
        setTimeout(() => {
          setDocLoading(false);
          setTimeout(() => {
            setIsInitialLoadComplete(true);
          }, 50);
        }, remaining);
      }
    }, (error) => {
      console.error("Error listening to document real-time changes:", error);
      setDocExists(false);
      setDocLoading(false);
    });

    return () => unsubscribe();
  }, [user, loading, documentId, ownerUidParam]);

  // ---------------------------------------------------------------------------
  // Real Firestore Auto-save with 2-second debounce
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isInitialLoadComplete || !user || !documentId || !docExists) return;
    if (userRole === 'viewer') return; // Read-only view cannot save

    const targetOwnerUid = ownerUidParam || user.uid;
    const docRef = doc(db, 'users', targetOwnerUid, 'documents', documentId);

    const savePendingTimer = setTimeout(() => {
      setIsSaving(true);
    }, 0);

    const saveTimer = setTimeout(async () => {
      try {
        await setDoc(docRef, {
          title,
          content,
          activeTemplateId,
          exportSettings,
          lastUpdatedBy: user.uid,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (error) {
        console.error("Error auto-saving to Firestore:", error);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => {
      clearTimeout(savePendingTimer);
      clearTimeout(saveTimer);
    };
  }, [title, content, activeTemplateId, exportSettings, isInitialLoadComplete, user, documentId, docExists, ownerUidParam, userRole]);

  // ---------------------------------------------------------------------------
  // Periodic version snapshot – every 3 minutes of active editing
  // ---------------------------------------------------------------------------
  const lastVersionedContent = useRef('');
  const lastVersionedTitle = useRef('');

  useEffect(() => {
    if (!isInitialLoadComplete || !user || !documentId || !docExists || userRole === 'viewer') return;

    const timer = setInterval(async () => {
      const hasChanged = content !== lastVersionedContent.current || title !== lastVersionedTitle.current;
      if (hasChanged && (content.trim() || title.trim())) {
        const targetOwnerUid = ownerUidParam || user.uid;
        const authorName = user.displayName || user.email?.split('@')[0] || 'Collaborator';
        try {
          await createDocumentVersion(targetOwnerUid, documentId, title, content, 'Auto checkpoint', authorName);
          lastVersionedContent.current = content;
          lastVersionedTitle.current = title;
          setVersionRefreshKey(k => k + 1);
        } catch (err) {
          console.error('Periodic versioning failed:', err);
        }
      }
    }, 3 * 60 * 1000); // every 3 minutes

    return () => clearInterval(timer);
  }, [isInitialLoadComplete, user, documentId, docExists, content, title, ownerUidParam, userRole]);

  // ---------------------------------------------------------------------------
  // Save a Firestore version checkpoint (used by AI & template actions)
  // ---------------------------------------------------------------------------
  const saveVersionCheckpoint = useCallback(async (actionLabel: string, newTitle?: string, newContent?: string) => {
    if (!user || !documentId) return;
    const snapshotTitle = newTitle ?? title;
    const snapshotContent = newContent ?? content;
    const targetOwnerUid = ownerUidParam || user.uid;
    const authorName = user.displayName || user.email?.split('@')[0] || 'Collaborator';
    try {
      await createDocumentVersion(targetOwnerUid, documentId, snapshotTitle, snapshotContent, actionLabel, authorName);
      setVersionRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Version checkpoint failed:', err);
    }
  }, [user, documentId, title, content, ownerUidParam]);

  // ---------------------------------------------------------------------------
  // Handle Version Restore
  // When restoring: snapshot the current state, then load the selected version
  // ---------------------------------------------------------------------------
  const handleVersionRestore = useCallback(async (restoredTitle: string, restoredContent: string) => {
    // 1. Flush any pending typing group
    if (undoDebounceTimer.current) {
      clearTimeout(undoDebounceTimer.current);
      undoDebounceTimer.current = null;
    }
    if (pendingUndoEntry.current) {
      pushUndo(pendingUndoEntry.current);
      pendingUndoEntry.current = null;
    }

    // 2. Save the current state as a new version before overwriting
    await saveVersionCheckpoint('Checkpoint before restore', title, content);

    // 3. Push current state onto undo stack
    pushUndo({ title, content });

    // 4. Restore the selected version
    setTitle(restoredTitle);
    setContent(restoredContent);

    // 5. Refresh version list
    setVersionRefreshKey(k => k + 1);
  }, [title, content, pushUndo, saveVersionCheckpoint]);

  // ---------------------------------------------------------------------------
  // Smart Template Engine state
  // ---------------------------------------------------------------------------
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<DocumentTemplate | null>(null);
  const [transformedContent, setTransformedContent] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [isAIResult, setIsAIResult] = useState(false);

  // ---------------------------------------------------------------------------
  // Handle Smart Template selection (triggers side-by-side transformation preview)
  // ---------------------------------------------------------------------------
  const handleSelectTemplate = useCallback(async (template: DocumentTemplate) => {
    setPendingTemplate(template);
    setIsComparisonOpen(true);
    setIsTransforming(true);
    setTransformedContent('');

    try {
      const result = await transformDocumentWithTemplate(content, template.id, true);
      setTransformedContent(result.content);
      setIsAIResult(result.isAI);
    } catch (err) {
      console.error('Template transformation error:', err);
      setTransformedContent(content);
    } finally {
      setIsTransforming(false);
    }
  }, [content]);

  // ---------------------------------------------------------------------------
  // Handle Regenerate Preview
  // ---------------------------------------------------------------------------
  const handleRegenerateTemplate = useCallback(async () => {
    if (!pendingTemplate) return;
    setIsTransforming(true);
    try {
      const result = await transformDocumentWithTemplate(content, pendingTemplate.id, true);
      setTransformedContent(result.content);
      setIsAIResult(result.isAI);
    } catch (err) {
      console.error('Template transformation error:', err);
    } finally {
      setIsTransforming(false);
    }
  }, [content, pendingTemplate]);

  // ---------------------------------------------------------------------------
  // Apply transformed template content to editor
  // ---------------------------------------------------------------------------
  const handleApplyTemplate = useCallback(async () => {
    if (!pendingTemplate || !transformedContent) return;

    pushUndo({ title, content });

    const newTitle = (!title || title === 'Untitled Document' || title === 'Untitled_Document')
      ? pendingTemplate.defaultTitle
      : title;

    setContent(transformedContent);
    setTitle(newTitle);
    setActiveTemplateId(pendingTemplate.id);

    const getExportSettingsForTemplate = (templateId: string): ExportSettings => {
      switch (templateId) {
        case 'resume':
          return { pageSize: 'A4', orientation: 'portrait', margins: 'narrow', customMargins: { top: 15, right: 15, bottom: 15, left: 15 }, fontSize: 'base', theme: 'professional' };
        case 'business-letter':
          return { pageSize: 'Letter', orientation: 'portrait', margins: 'standard', customMargins: { top: 20, right: 20, bottom: 20, left: 20 }, fontSize: 'base', theme: 'minimal' };
        case 'project-report':
          return { pageSize: 'A4', orientation: 'portrait', margins: 'standard', customMargins: { top: 20, right: 20, bottom: 20, left: 20 }, fontSize: 'base', theme: 'academic' };
        default:
          return exportSettings;
      }
    };

    setExportSettings(getExportSettingsForTemplate(pendingTemplate.id));

    // Save checkpoint for version history with action details
    await saveVersionCheckpoint(`Applied ${pendingTemplate.name} Template`, newTitle, '');

    toast.success('Template Applied', {
      description: `Document layout updated with ${pendingTemplate.name}.`,
    });

    setIsComparisonOpen(false);
  }, [pendingTemplate, transformedContent, title, content, pushUndo, exportSettings, saveVersionCheckpoint]);

  const handleResetWorkspace = useCallback(() => {
    if (userRole === 'viewer') return;
    pushUndo({ title, content });
    setContent('');
    setTitle('Untitled_Document');
    setActiveTemplateId(null);
  }, [title, content, pushUndo, userRole]);

  // ---------------------------------------------------------------------------
  // Back to Dashboard handler
  // ---------------------------------------------------------------------------
  const handleBackToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  // ---------------------------------------------------------------------------
  // Action Handler: Exporting document (PDF, Word, Markdown)
  // ---------------------------------------------------------------------------
  const handleExport = useCallback(async (format: 'pdf' | 'docx' | 'markdown') => {
    const fileName = (title || 'Untitled_Document').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      if (format === 'markdown') {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'pdf') {
        const { exportToPDF } = await import('@/utils/pdfExport');
        await exportToPDF('pdf-export-content', title, exportSettings);
      } else {
        const { compileMarkdownToHtml } = await import('@/utils/markdown');
        const compiledHtml = compileMarkdownToHtml(content);

        const fontName = exportSettings.theme === 'minimal' ? 'Courier New' : exportSettings.theme === 'academic' ? 'Georgia' : 'Arial';
        const fontSizePt = exportSettings.fontSize === 'sm' ? '10.5pt' : exportSettings.fontSize === 'lg' ? '13.5pt' : '11.5pt';

        const docHtml = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <title>${title}</title>
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
              h1 {
                font-size: 24pt;
                font-weight: bold;
                color: #111827;
                margin-top: 18pt;
                margin-bottom: 8pt;
              }
              h2 {
                font-size: 16pt;
                font-weight: bold;
                color: #1f2937;
                margin-top: 14pt;
                margin-bottom: 6pt;
                border-bottom: 1.5px solid #e5e7eb;
                padding-bottom: 3pt;
              }
              h3 {
                font-size: 13pt;
                font-weight: bold;
                color: #374151;
                margin-top: 12pt;
                margin-bottom: 4pt;
              }
              p {
                margin-top: 0;
                margin-bottom: 8pt;
              }
              ul, ol {
                margin-top: 0;
                margin-bottom: 8pt;
                padding-left: 20pt;
              }
              li {
                margin-bottom: 3pt;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 14pt;
              }
              th, td {
                border: 1px solid #d1d5db;
                padding: 8px 10px;
                text-align: left;
                font-size: 10pt;
              }
              th {
                background-color: #f9fafb;
                font-weight: bold;
                color: #111827;
              }
              a {
                color: #4f46e5;
                text-decoration: underline;
              }
              hr {
                border: 0;
                border-top: 1px solid #e5e7eb;
                margin: 16pt 0;
              }
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
    } catch (e) {
      console.error('Export failed', e);
    }
  }, [title, content, exportSettings]);

  // ---------------------------------------------------------------------------
  // Action Handler: Sharing document as actual File
  // ---------------------------------------------------------------------------
  const handleShareFile = useCallback(async (format: 'pdf' | 'docx' | 'markdown') => {
    const fileName = (title || 'Untitled_Document').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      let fileBlob: Blob | undefined;
      let fileExt = '';
      let mimeType = '';

      if (format === 'markdown') {
        fileBlob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
        fileExt = 'md';
        mimeType = 'text/markdown';
      } else if (format === 'docx') {
        const { compileMarkdownToHtml } = await import('@/utils/markdown');
        const compiledHtml = compileMarkdownToHtml(content);
        const fontName = exportSettings.theme === 'minimal' ? 'Courier New' : exportSettings.theme === 'academic' ? 'Georgia' : 'Arial';
        const fontSizePt = exportSettings.fontSize === 'sm' ? '10.5pt' : exportSettings.fontSize === 'lg' ? '13.5pt' : '11.5pt';

        const docHtml = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <title>${title}</title>
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
      } else {
        const { exportToPDF } = await import('@/utils/pdfExport');
        const pdfBlob = await exportToPDF('pdf-export-content', title, exportSettings, 'blob');
        if (pdfBlob) {
          fileBlob = pdfBlob;
          fileExt = 'pdf';
          mimeType = 'application/pdf';
        }
      }

      if (fileBlob) {
        const fileObj = new File([fileBlob], `${fileName}.${fileExt}`, { type: mimeType });
        if (navigator.canShare && navigator.canShare({ files: [fileObj] })) {
          await navigator.share({
            files: [fileObj],
            title: title,
            text: `Shared document: ${title}`
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
  }, [title, content, exportSettings]);

  const handleShareLink = useCallback((platform: 'whatsapp' | 'gmail' | 'telegram' | 'link', role: 'editor' | 'viewer' = 'editor') => {
    if (!user) return;
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const docUrl = `${baseUrl}?owner=${user.uid}&role=${role}`;
    const text = `Collaborate with me on this document on Dastavezz ("${title}") as an ${role === 'editor' ? 'Editor' : 'Viewer'}:\nLink: ${docUrl}`;

    if (platform === 'link') {
      navigator.clipboard.writeText(docUrl);
      toast.success(`Share Link (${role === 'editor' ? 'Editor' : 'Viewer'}) copied to clipboard!`);
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'gmail') {
      window.open(`mailto:?subject=${encodeURIComponent(`Collaborate: ${title}`)}&body=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(docUrl)}&text=${encodeURIComponent(`Collaborate with me on "${title}"`)}`, '_blank');
    }
  }, [title, user]);

  // ---------------------------------------------------------------------------
  // Text metrics helpers
  // ---------------------------------------------------------------------------
  const getWordCount = () => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  };

  const getCharCount = () => content.length;

  // ---------------------------------------------------------------------------
  // Loading states
  // ---------------------------------------------------------------------------
  if (loading || (user && docLoading)) {
    return <BrandLoader message="Loading Workspace..." />;
  }

  if (!user) return null;

  // Document Not Found fallback view
  if (!docExists) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans select-none justify-between">
        <header className="border-b border-slate-800/40 bg-slate-900/60 backdrop-blur-lg h-14 flex items-center px-6">
          <div className="flex items-center space-x-3">
            <DastavezzIcon size={28} />
            <div>
              <h1 className="bg-gradient-to-r from-violet-400 via-indigo-200 to-white bg-clip-text text-sm font-bold tracking-tight text-transparent">
                Dastavezz
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-slate-800/60 bg-slate-900/20 p-8 rounded-2xl text-center space-y-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Document Not Found</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The document workspace you are trying to access does not exist, has been deleted, or you do not have permission to view it.
              </p>
            </div>
            <Button
              onClick={handleBackToDashboard}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs h-9 cursor-pointer w-full"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Dashboard
            </Button>
          </div>
        </main>

        <footer className="h-10"></footer>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main Editor Layout
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background text-foreground font-sans">
      {/* 1. Global Navigation Bar */}
      <Navbar
        title={title}
        onTitleChange={handleTitleChange}
        onReset={handleResetWorkspace}
        isSaving={isSaving}
        view="editor"
        onBackToDashboard={handleBackToDashboard}
        onExport={handleExport}
        onShareFile={handleShareFile}
        onShareLink={handleShareLink}
        userRole={userRole}
        activeCollaborators={activeCollaborators}
      />

      {/* 2. Top Section Template Gallery Selector */}
      <div className={userRole === 'viewer' ? 'pointer-events-none opacity-50 select-none' : ''}>
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
          activeTemplateId={activeTemplateId}
        />
      </div>

      {/* 3. Main Work Area (Desktop Split Grid + Mobile Tabbed View) */}
      <main className="flex-1 w-full max-w-full mx-auto px-0 lg:px-5 py-0 lg:py-4 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0a0a0c] pb-16 lg:pb-0">

        {/* DESKTOP SPLIT GRID (lg:grid) - 100% UNTOUCHED */}
        <div className="hidden lg:grid grid-cols-24 gap-6 flex-1 lg:h-[calc(100vh-270px)] lg:min-h-[500px] overflow-hidden">
          {/* Column 1: Document Editor Pane (Span 7) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
            <DocumentEditor
              content={content}
              onContentChange={handleContentChange}
              wordCount={getWordCount()}
              charCount={getCharCount()}
              onSelectionChange={setSelectedText}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              readOnly={userRole === 'viewer'}
            />
          </div>

          {/* Column 2: Live Document Preview (Span 12) */}
          <div className="lg:col-span-12 flex flex-col h-full overflow-hidden">
            <LivePreview
              content={content}
              title={title}
              settings={exportSettings}
              onSettingsChange={setExportSettings}
            />
          </div>

          {/* Column 3: Tabbed Panel - AI / Export / History (Span 5) */}
          <div className="lg:col-span-5 flex flex-col h-full overflow-hidden space-y-4">
            <div className="flex items-stretch bg-white dark:bg-[#18181d] border border-slate-200 dark:border-white/[0.07] rounded-2xl shadow-sm dark:shadow-black/30 overflow-hidden shrink-0">
              {([
                { key: 'ai', icon: <Sparkles className="h-4 w-4" />, label: 'Dastavezz AI', color: activeTab === 'ai' ? 'from-violet-500 to-indigo-600' : '' },
                { key: 'export', icon: <Settings className="h-4 w-4" />, label: 'Layout', color: activeTab === 'export' ? 'from-slate-700 to-slate-900' : '' },
                { key: 'history', icon: <Clock className="h-4 w-4" />, label: 'History', color: activeTab === 'history' ? 'from-slate-700 to-slate-900' : '' }
              ] as const).map(({ key, icon, label, color }, idx) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative flex-1 flex flex-col items-center justify-center space-y-1 py-3.5 px-2 text-center transition-all duration-200 cursor-pointer ${idx > 0 ? 'border-l border-slate-100 dark:border-white/[0.05]' : ''
                    } ${activeTab === key
                      ? 'bg-gradient-to-b ' + color + ' text-white shadow-sm'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`}
                >
                  <div className={`transition-transform duration-200 ${activeTab === key ? 'scale-110' : ''}`}>
                    {icon}
                  </div>
                  <span className={`text-[9.5px] font-bold tracking-wide leading-none whitespace-nowrap ${activeTab === key ? 'text-white/90' : ''}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              {activeTab === 'ai' ? (
                <AIAssistant
                  content={content}
                  onContentChange={handleContentChange}
                  onTitleChange={handleTitleChange}
                  title={title}
                  templateId={activeTemplateId}
                  selectedText={selectedText}
                  wordCount={getWordCount()}
                  onAICheckpoint={saveVersionCheckpoint}
                  readOnly={userRole === 'viewer'}
                />
              ) : activeTab === 'export' ? (
                <ExportControls
                  settings={exportSettings}
                  onSettingsChange={setExportSettings}
                  documentTitle={title}
                  documentContent={content}
                />
              ) : (
                <VersionHistory
                  key={versionRefreshKey}
                  documentId={documentId}
                  onRestore={handleVersionRestore}
                />
              )}
            </div>
          </div>
        </div>

        {/* MOBILE DEDICATED VIEW (lg:hidden) - FULL PAGE NATIVE SWAP */}
        <div className="lg:hidden flex flex-col flex-1 h-full min-h-0 overflow-hidden">
          {mobileTab === 'editor' && (
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
              <DocumentEditor
                content={content}
                onContentChange={handleContentChange}
                wordCount={getWordCount()}
                charCount={getCharCount()}
                onSelectionChange={setSelectedText}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                readOnly={userRole === 'viewer'}
              />
            </div>
          )}

          {mobileTab === 'preview' && (
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
              <LivePreview
                content={content}
                title={title}
                settings={exportSettings}
                onSettingsChange={setExportSettings}
              />
            </div>
          )}

          {mobileTab === 'ai' && (
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
              <AIAssistant
                content={content}
                onContentChange={handleContentChange}
                onTitleChange={handleTitleChange}
                title={title}
                templateId={activeTemplateId}
                selectedText={selectedText}
                wordCount={getWordCount()}
                onAICheckpoint={saveVersionCheckpoint}
                readOnly={userRole === 'viewer'}
              />
            </div>
          )}

          {mobileTab === 'history' && (
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
              <VersionHistory
                key={versionRefreshKey}
                documentId={documentId}
                onRestore={handleVersionRestore}
              />
            </div>
          )}
        </div>
      </main>

      {/* MOBILE NATIVE BOTTOM NAVIGATION BAR (lg:hidden) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121217]/95 border-t border-slate-200 dark:border-white/[0.08] backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl select-none">
        {[
          { key: 'editor', label: 'Editor', icon: <FileText className="h-4.5 w-4.5" /> },
          { key: 'preview', label: 'Preview', icon: <Eye className="h-4.5 w-4.5" /> },
          { key: 'ai', label: 'AI Assistant', icon: <Sparkles className="h-4.5 w-4.5 text-violet-400" /> },
          { key: 'history', label: 'History', icon: <Clock className="h-4.5 w-4.5" /> },
        ].map((tab) => {
          const isActive = mobileTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMobileTab(tab.key as any)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer ${isActive
                  ? 'text-violet-600 dark:text-violet-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <div className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Workspace Footer */}
      <footer className="hidden lg:block w-full py-3 border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0c] shrink-0 text-center select-none text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-wide">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto px-6">
          <span>© 2026 Dastavezz. All rights reserved.</span>
          <span className="mt-1 sm:mt-0">Made with ❤️ by Dastavezz.</span>
        </div>
      </footer>

      {/* Hidden PDF render layer (permanently mounted to DOM for global export buttons) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none', userSelect: 'none' }}>
        <div
          id="pdf-export-content"
          style={getPaperDimensions(exportSettings.pageSize, exportSettings.orientation)}
          className={`a4-sheet bg-white text-black p-12 transition-all duration-300 ${getThemeClass(exportSettings.theme)} ${getFontSizeClass(exportSettings.fontSize)}`}
        >
          <div className="prose max-w-none break-words">
            {compileMarkdown(content)}
          </div>
        </div>
      </div>

      {/* Smart Template Comparison Side-by-Side Modal */}
      <TemplateComparison
        isOpen={isComparisonOpen}
        onOpenChange={setIsComparisonOpen}
        originalContent={content}
        transformedContent={transformedContent}
        templateName={pendingTemplate?.name || 'Template'}
        isAI={isAIResult}
        isLoading={isTransforming}
        onApply={handleApplyTemplate}
        onRegenerate={handleRegenerateTemplate}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF Export Sizing & Style mapping helper functions
// ---------------------------------------------------------------------------
const getThemeClass = (theme: ExportSettings['theme']) => {
  switch (theme) {
    case 'minimal': return 'doc-theme-minimal font-mono tracking-tight text-gray-800';
    case 'academic': return 'doc-theme-academic font-serif leading-relaxed text-gray-900';
    case 'professional':
    default: return 'doc-theme-professional font-sans tracking-wide text-gray-850';
  }
};

const getFontSizeClass = (fontSize: ExportSettings['fontSize']) => {
  switch (fontSize) {
    case 'sm': return 'text-[11px] prose-sm';
    case 'lg': return 'text-[15px] prose-lg';
    case 'base':
    default: return 'text-[13px] prose-base';
  }
};

const getPaperDimensions = (pageSize: ExportSettings['pageSize'], orientation: ExportSettings['orientation']) => {
  let width = 794;
  let height = 1123;
  switch (pageSize) {
    case 'Letter': width = 816; height = 1056; break;
    case 'Legal': width = 816; height = 1344; break;
    case 'A3': width = 1123; height = 1587; break;
    case 'A5': width = 559; height = 794; break;
    case 'B5': width = 665; height = 941; break;
    case 'A4':
    default: width = 794; height = 1123; break;
  }
  if (orientation === 'landscape') {
    return { width: `${height}px`, minHeight: `${width}px` };
  }
  return { width: `${width}px`, minHeight: `${height}px` };
};
