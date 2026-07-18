'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import DocumentDashboard from '@/components/workspace/DocumentDashboard';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Protect the dashboard route
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white select-none">
        <div className="flex flex-col items-center space-y-4">
          <Sparkles className="h-8 w-8 text-violet-500 animate-spin" />
          <span className="text-sm font-semibold tracking-wider animate-pulse">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Navbar
        title="Dashboard"
        onTitleChange={() => {}}
        onReset={() => {}}
        isSaving={false}
        view="dashboard"
      />
      <main className="flex-1 w-full">
        <DocumentDashboard
          onOpenDocument={(docId) => router.push(`/workspace/${docId}`)}
        />
      </main>
    </div>
  );
}
