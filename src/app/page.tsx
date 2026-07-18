'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ui/ThemeToggle';

import Hero from '@/components/landing/Hero';
import WorkspacePreview from '@/components/landing/WorkspacePreview';
import Features from '@/components/landing/Features';
import Templates from '@/components/landing/Templates';
import AIWorkflow from '@/components/landing/AIWorkflow';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/landing/AuthModal';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleWorkspaceAccess = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-slate-100 font-sans select-none overflow-x-hidden">

      {/* ── Landing Navbar ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 z-50 w-full">
        <div className="mx-auto max-w-[1200px] px-6 pt-4">
          <nav className="flex h-12 items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl px-4 shadow-sm shadow-black/[0.04]">
            {/* Brand */}
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-white dark:text-slate-900" />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Dastavezz
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center space-x-2">
              <ThemeToggle variant="icon" />
              <Link href="/dashboard" onClick={handleWorkspaceAccess}>
                <Button
                  size="sm"
                  className="h-8 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 cursor-pointer px-4 rounded-xl shadow-none border-0 tracking-wide"
                >
                  Open Workspace
                  <ArrowRight className="h-3 w-3 ml-1.5" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Page Sections ───────────────────────────────────────────────────── */}
      <Hero />
      <WorkspacePreview />
      <Features />
      <Templates />
      <AIWorkflow />
      <FAQ />
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onSuccess={() => router.push('/dashboard')}
      />
    </div>
  );
}
