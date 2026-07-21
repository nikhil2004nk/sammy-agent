'use client';

import { useUIStore } from '@/store/ui';
import { Search, Plus, Bell, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { workspaces, activeWorkspaceId, logout } = useAuthStore();
  const router = useRouter();

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  const handleLogout = async () => {
    await apiClient('/auth/logout', { method: 'POST', requireAuth: true });
    logout();
    router.push('/login');
  };

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
            J
          </div>
          <button className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors">
            {activeWorkspace ? activeWorkspace.name : 'Personal'}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-muted-foreground bg-surface border-border">
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span>
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full bg-surface border border-border">
          <User className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}
