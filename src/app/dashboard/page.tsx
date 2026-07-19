'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import DocumentDashboard from '@/components/workspace/DocumentDashboard';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import BrandLoader from '@/components/brand/BrandLoader';

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
    return <BrandLoader message="Loading Dashboard..." />;
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
