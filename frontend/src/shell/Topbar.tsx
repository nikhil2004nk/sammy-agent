'use client';

import { useUIStore } from '@/store/ui';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { sidebarOpen, toggleSidebar, activityPanelOpen, toggleActivityPanel } = useUIStore();
  const { workspaces, activeWorkspaceId, logout } = useAuthStore();
  const router = useRouter();

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  const handleLogout = async () => {
    await apiClient('/auth/logout', { method: 'POST', requireAuth: true });
    logout();
    router.push('/login');
  };

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </Button>
        
        <div className="text-sm font-medium">
          {activeWorkspace ? activeWorkspace.name : 'No Workspace'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-muted-foreground">
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        
        <Button variant="ghost" size="icon" onClick={toggleActivityPanel}>
          {activityPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </Button>

        <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">
          Logout
        </Button>
      </div>
    </header>
  );
}
