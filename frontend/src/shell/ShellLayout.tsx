'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Topbar } from './Topbar';
import { StatusBar } from './StatusBar';
import { CommandPalette } from './CommandPalette';
import { Toaster } from '@/components/ui/sonner';

interface ShellLayoutProps {
  children: React.ReactNode;
}

export function ShellLayout({ children }: ShellLayoutProps) {
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
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <CommandPalette />
      <Toaster />
      
      {/* Topbar */}
      <Topbar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-surface relative">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      <StatusBar />
    </div>
  );
}
