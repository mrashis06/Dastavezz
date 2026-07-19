'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import HeroBackground from './HeroBackground';

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
    <section className="relative pt-36 pb-16 px-6 overflow-hidden">
      {/* Cinematic AI Animated Background */}
      <HeroBackground />

      <div className="max-w-[1200px] mx-auto text-center relative z-10">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 mb-8 px-4 py-1.5 rounded-full border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04] backdrop-blur-md shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
            Next-Gen AI Document Workspace
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.04] mb-8 mx-auto max-w-4xl"
        >
          Write smarter.<br />
          <span className="relative inline-block">
            <span className="relative z-10 text-slate-900 dark:text-white">Ship faster</span>
            <span className="absolute -bottom-1.5 left-0 right-0 h-[0.2em] bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 rounded-full blur-[1px] opacity-80" />
          </span>{' '}
          <span className="text-slate-400 dark:text-slate-600 font-bold">with AI.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-10 font-normal"
        >
          Dastavezz combines a clean Markdown editor with intelligent AI assistance to help you write, format, and export resumes, reports, business letters, and more—beautifully and effortlessly.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <Link href="/dashboard" onClick={handleAccess}>
            <button className="group relative inline-flex items-center justify-center h-12 px-7 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 shadow-xl shadow-violet-500/10 hover:shadow-violet-500/20 cursor-pointer">
              <span>Start for free</span>
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </motion.div>

      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        onSuccess={() => router.push('/dashboard')}
      />
    </section>
  );
}
