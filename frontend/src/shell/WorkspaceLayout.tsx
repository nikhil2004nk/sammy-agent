'use client';

import React from 'react';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { CommandPalette } from './CommandPalette';
import { Toaster } from '@/components/ui/sonner';
import { Topbar } from './Topbar';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <CommandPalette />
      <Toaster />
      
      {/* Left Sidebar */}
      <WorkspaceSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background relative">
        <Topbar />
        <main className="flex-1 flex overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
