'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BrandLoader from '@/components/brand/BrandLoader';

export default function WorkspaceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return <BrandLoader message="Redirecting to Dashboard..." />;
}
