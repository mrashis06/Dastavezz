'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function WorkspaceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white select-none">
      <div className="flex flex-col items-center space-y-4">
        <Sparkles className="h-8 w-8 text-violet-500 animate-spin" />
        <span className="text-sm font-semibold tracking-wider animate-pulse">Redirecting to Dashboard...</span>
      </div>
    </div>
  );
}
