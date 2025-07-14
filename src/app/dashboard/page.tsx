
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrahmaLogoIcon } from '@/components/layout/brahma-logo-icon';

// The main dashboard page now redirects to the new chat interface.
export default function DashboardHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/chat/new');
  }, [router]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <BrahmaLogoIcon className="h-12 w-12 animate-spin"/>
      <p className="text-muted-foreground">Redirecting to chat...</p>
    </div>
  );
}
