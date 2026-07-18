'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const FAQS = [
  {
    q: 'Does Dastavezz store my document content?',
    a: 'Your documents are stored securely in Firestore, tied to your authenticated account. We never sell or share your data. You can delete any document at any time from your dashboard.',
  },
  {
    q: 'What document formats does it export to?',
    a: 'Dastavezz exports to three formats: PDF (styled, A4-ready), Microsoft Word (.docx), and raw Markdown (.md). PDF export preserves full typography, margins, and layout settings.',
  },
  {
    q: 'How does the AI stay relevant to my document?',
    a: 'Every AI action receives your full document context — the template type, current title, word count, and complete content. This makes suggestions accurate and document-aware, not generic.',
  },
  {
    q: 'How are page breaks handled in PDF export?',
    a: 'Insert \\pagebreak or <!-- pagebreak --> anywhere in your Markdown. The PDF compiler converts these into clean print page breaks, dividing content across pages precisely.',
  },
  {
    q: 'Can I undo AI changes?',
    a: 'Yes. Before every AI action, a version checkpoint is created automatically. You can restore any previous version from the History panel, or use Ctrl+Z to undo immediately.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Dastavezz is currently completely free. Sign in with Google to access your personal document workspace with full AI capabilities, unlimited documents, and all export formats.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-28 px-6">
      <div className="max-w-[1200px] mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 items-start">
          {/* Left: header */}
          <div className="lg:sticky lg:top-24">
            <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              Common questions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Everything about document editing, AI assistance, export, and data privacy.
            </p>
          </div>

          {/* Right: accordion */}
          <div className="space-y-0 border-t border-slate-200 dark:border-white/[0.06]">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-slate-200 dark:border-white/[0.06]">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex items-center justify-between w-full text-left py-5 gap-6 group cursor-pointer"
                >
                  <span className={`text-sm font-semibold leading-snug transition-colors duration-200 ${openIndex === i ? 'text-violet-600 dark:text-violet-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    {faq.q}
                  </span>
                  <div className={`flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${openIndex === i ? 'bg-violet-600 border-violet-600 rotate-45' : 'border-slate-300 dark:border-white/[0.1] text-slate-400 dark:text-slate-600 group-hover:border-slate-400 dark:group-hover:border-white/[0.2]'}`}>
                    <Plus className={`h-3.5 w-3.5 transition-colors duration-200 ${openIndex === i ? 'text-white' : ''}`} />
                  </div>
                </button>
                {openIndex === i && (
                  <div className="pb-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
