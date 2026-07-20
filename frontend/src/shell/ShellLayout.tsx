'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { SecondarySidebar } from './SecondarySidebar';
import { Topbar } from './Topbar';
import { ActivityPanel } from './ActivityPanel';
import { StatusBar } from './StatusBar';
import { CommandPalette } from './CommandPalette';
import { Toaster } from '@/components/ui/sonner';

interface ShellLayoutProps {
  children: React.ReactNode;
}

export function ShellLayout({ children }: ShellLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <CommandPalette />
      <Toaster />
      
      {/* Left Sidebar */}
      <Sidebar />
      <SecondarySidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        
        <main className="flex-1 overflow-hidden relative flex">
          {/* Main Module (e.g. Conversation Panel) */}
          <div className="flex-1 overflow-auto bg-background">
            {children}
          </div>

          {/* Right Activity Panel */}
          <ActivityPanel />
        </main>

        <StatusBar />
      </div>
    </div>
  );
}
