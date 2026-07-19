'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const TYPE_CONFIGS = {
  success: {
    icon: CheckCircle2,
    badgeStyle:
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20',
    glowStyle: 'shadow-emerald-500/5',
  },
  error: {
    icon: XCircle,
    badgeStyle:
      'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 border border-red-500/20',
    glowStyle: 'shadow-red-500/5',
  },
  warning: {
    icon: AlertTriangle,
    badgeStyle:
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20',
    glowStyle: 'shadow-amber-500/5',
  },
  info: {
    icon: Info,
    badgeStyle:
      'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-500/20',
    glowStyle: 'shadow-blue-500/5',
  },
  loading: {
    icon: Loader2,
    badgeStyle:
      'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 border border-violet-500/20',
    glowStyle: 'shadow-violet-500/5',
  },
};

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const duration = toast.duration ?? (toast.type === 'loading' ? Infinity : 4500);

  useEffect(() => {
    if (duration === Infinity) return;

    if (!isHovered) {
      timerRef.current = setTimeout(() => {
        onDismiss(toast.id);
      }, duration);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, duration, isHovered, onDismiss]);

  const config = TYPE_CONFIGS[toast.type] || TYPE_CONFIGS.info;
  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.92, transition: { duration: 0.15 } }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative pointer-events-auto w-full sm:w-[380px] min-w-[300px] select-none
        rounded-2xl bg-white/90 dark:bg-[#121216]/90 backdrop-blur-xl 
        border border-slate-200/80 dark:border-white/[0.08] 
        shadow-xl shadow-black/5 dark:shadow-black/40 ${config.glowStyle}
        p-3.5 px-4 flex items-center justify-between gap-3 transition-shadow duration-200`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Accent Icon Badge */}
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${config.badgeStyle}`}>
          <IconComponent
            className={`h-4 w-4 ${toast.type === 'loading' ? 'animate-spin' : ''}`}
          />
        </div>

        {/* Text Stack */}
        <div className="flex flex-col min-w-0 flex-1 pt-0.5">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
            {toast.title}
          </h4>
          {toast.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-normal mt-0.5">
              {toast.description}
            </p>
          )}
        </div>
      </div>

      {/* Hover-revealed Close Button */}
      {toast.type !== 'loading' && (
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 
            rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white 
            hover:bg-slate-100 dark:hover:bg-white/[0.06] shrink-0 cursor-pointer"
          aria-label="Close notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      className="fixed z-[99999] pointer-events-none
        bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5
        flex flex-col gap-2.5 items-center sm:items-end"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
