'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, RotateCcw, Sparkles, Settings as SettingsIcon, Download, Share2, LogOut, ChevronLeft, Loader2, Settings } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/AuthProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useRouter } from 'next/navigation';

import DastavezzIcon from '@/components/brand/DastavezzIcon';

interface NavbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onReset: () => void;
  isSaving?: boolean;
  view?: 'dashboard' | 'editor';
  onBackToDashboard?: () => void;
  onExport?: (format: 'pdf' | 'docx' | 'markdown') => void;
  onShareFile?: (format: 'pdf' | 'docx' | 'markdown') => void;
  onShareLink?: (platform: 'whatsapp' | 'gmail' | 'telegram' | 'link') => void;
}

export default function Navbar({
  title,
  onTitleChange,
  onReset,
  isSaving = false,
  view = 'editor',
  onBackToDashboard,
  onExport,
  onShareFile,
  onShareLink
}: NavbarProps) {
  const { user, profile, signOutUser } = useAuth();
  const router = useRouter();

  const getInitials = (name: string) => {
    if (!name) return 'US';
    return name.split(' ').filter(Boolean).map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/[0.06] bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-13 max-w-full items-center justify-between px-4 md:px-5 gap-3">

        {/* ── Left: Brand + Back ───────────────────────────────────────────── */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Brand mark */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <DastavezzIcon size={26} />
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">Dastavezz</span>
          </Link>

          {/* Back button */}
          {view === 'editor' && onBackToDashboard && (
            <>
              <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />
              <button
                onClick={onBackToDashboard}
                className="flex items-center space-x-1.5 h-7 px-2.5 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all duration-150 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden md:block">Documents</span>
              </button>
            </>
          )}
        </div>

        {/* ── Center: Document title ───────────────────────────────────────── */}
        {view === 'editor' && (
          <div className="flex-1 flex items-center justify-center px-4 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="bg-transparent text-sm font-semibold focus:outline-none w-full max-w-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-center truncate border-none ring-0 focus:ring-0"
              placeholder="Untitled Document"
            />
          </div>
        )}

        {/* Dashboard brand center */}
        {view === 'dashboard' && (
          <div className="flex-1" />
        )}

        {/* ── Right: Controls + Avatar ─────────────────────────────────────── */}
        <div className="flex items-center space-x-2 shrink-0">

          {view === 'editor' && (
            <>
              {/* Save status pill */}
              <div className="flex items-center shrink-0">
                {isSaving ? (
                  <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 px-2.5 py-1 rounded-full">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    <span>Saving</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Saved</span>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08]" />

              {/* Export dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1.5 h-7 px-3 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.15] hover:bg-slate-50 dark:hover:bg-white/[0.07] transition-all duration-150 cursor-pointer">
                  <Download className="h-3.5 w-3.5 text-slate-400" />
                  <span className="hidden sm:block">Export</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181d] shadow-xl shadow-black/10 p-1">
                  <div className="text-[10px] text-slate-450 dark:text-slate-500 px-3 py-1.5 font-bold uppercase tracking-widest select-none">Export as</div>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06] my-1" />
                  <DropdownMenuItem 
                    onClick={() => onExport?.('pdf')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>PDF (.pdf)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onExport?.('docx')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>Word (.docx)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onExport?.('markdown')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>Markdown (.md)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Share dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1.5 h-7 px-3 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.15] hover:bg-slate-50 dark:hover:bg-white/[0.07] transition-all duration-150 cursor-pointer">
                  <Share2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="hidden sm:block">Share</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181d] shadow-xl shadow-black/10 p-1">
                  <div className="text-[10px] text-slate-450 dark:text-slate-500 px-3 py-1.5 font-bold uppercase tracking-widest select-none">Share as File</div>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06] my-1" />
                  <DropdownMenuItem 
                    onClick={() => onShareFile?.('pdf')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>PDF (.pdf)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onShareFile?.('docx')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>Word (.doc)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onShareFile?.('markdown')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>Markdown (.md)</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06] my-1" />
                  <div className="text-[10px] text-slate-450 dark:text-slate-500 px-3 py-1.5 font-bold uppercase tracking-widest select-none">Share Link</div>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06] my-1" />
                  <DropdownMenuItem 
                    onClick={() => onShareLink?.('whatsapp')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>WhatsApp</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onShareLink?.('gmail')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>Gmail</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onShareLink?.('telegram')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>Telegram</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06] my-1" />
                  <DropdownMenuItem 
                    onClick={() => onShareLink?.('link')}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
                  >
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer border-0 outline-none">
                  <SettingsIcon className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#18181d] shadow-xl shadow-black/10 p-1">
                  <div className="text-[10px] text-slate-450 dark:text-slate-500 px-3 py-1.5 font-bold uppercase tracking-widest select-none">Workspace</div>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06] my-1" />
                  <DropdownMenuItem
                    onClick={onReset}
                    className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Clear workspace</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08]" />
            </>
          )}

          {/* Theme toggle */}
          <ThemeToggle variant="menu" />

          <div className="h-4 w-px bg-slate-200 dark:bg-white/[0.08]" />
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
              <Avatar className="h-7 w-7 border border-slate-200 dark:border-white/[0.1] hover:scale-105 transition-transform duration-150 cursor-pointer select-none">
                {profile?.avatar && profile.avatar.startsWith('http') ? (
                  <AvatarImage src={profile.avatar} alt={profile.fullName || 'User'} />
                ) : user?.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={profile?.fullName || user.displayName || 'User'} />
                ) : null}
                <AvatarFallback 
                  className="text-white dark:text-slate-900 font-bold text-[10px]"
                  style={{
                    background: profile?.avatar && profile.avatar.startsWith('linear-gradient') ? profile.avatar : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                    color: '#ffffff'
                  }}
                >
                  {getInitials(profile?.fullName || user?.displayName || user?.email || '')}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#18181d] shadow-xl shadow-black/10 p-1">
              <div className="flex flex-col px-3 py-2.5">
                <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">{profile?.fullName || user?.displayName || 'User'}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-normal mt-0.5">{profile?.email || user?.email}</span>
              </div>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06] my-1" />
              
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-350 focus:bg-slate-50 dark:focus:bg-white/[0.06]"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Account Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06] my-1" />
              <DropdownMenuItem
                onClick={signOutUser}
                className="text-xs font-medium cursor-pointer rounded-lg px-3 py-2 flex items-center space-x-2 text-slate-500 dark:text-slate-450 hover:text-red-500 focus:bg-slate-50 dark:focus:bg-white/[0.06] focus:text-red-500"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
