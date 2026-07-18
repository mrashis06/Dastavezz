'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';

export default function Hero() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleAccess = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsAuthOpen(true);
    }
  };

  return (
    <section className="relative pt-40 pb-28 px-6 overflow-hidden">
      {/* Subtle background geometry */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.07),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.12),transparent)] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto text-center relative">

        {/* Eyebrow badge */}
        <div className="inline-flex items-center space-x-2 mb-8 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] shadow-sm">
          <Sparkles className="h-3 w-3 text-violet-500" />
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 tracking-wide">AI Document Workspace</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-6 mx-auto max-w-4xl">
          Write smarter.<br />
          <span className="relative">
            <span className="relative z-10 text-slate-900 dark:text-white">Ship faster</span>
            <span className="absolute -bottom-1 left-0 right-0 h-[0.18em] bg-gradient-to-r from-violet-500/70 via-indigo-500/70 to-violet-400/30 rounded-full blur-[1px]" />
          </span>{' '}
          <span className="text-slate-400 dark:text-slate-600">with AI.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-10 font-normal">
          Dastavezz combines a clean Markdown editor with intelligent AI assistance to help you write, format, and export resumes, reports, business letters, and more—beautifully and effortlessly.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" onClick={handleAccess}>
            <button className="group inline-flex items-center h-11 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 shadow-sm shadow-black/10 hover:shadow-md hover:shadow-black/10 cursor-pointer">
              Start for free
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-[11px] text-slate-400 dark:text-slate-600 font-medium tracking-wide">

        </p>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        onSuccess={() => router.push('/dashboard')}
      />
    </section>
  );
}
