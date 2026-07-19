'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, ToastData } from '@/components/ui/Toast';
import { subscribeToast, subscribeDismiss } from '@/utils/toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribeAdd = subscribeToast((newToast) => {
      setToasts((prev) => [...prev, newToast]);
    });

    const unsubscribeDismiss = subscribeDismiss((id) => {
      handleDismiss(id);
    });

    return () => {
      unsubscribeAdd();
      unsubscribeDismiss();
    };
  }, [handleDismiss]);

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onDismiss={handleDismiss} />
    </>
  );
}
