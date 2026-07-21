'use client';

import { Circle, Database, Server, Zap, Wifi } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export function StatusBar() {
  const { workspaces, activeWorkspaceId } = useAuthStore();
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  return (
    <footer className="h-7 border-t border-border bg-background flex items-center justify-between px-3 shrink-0 text-[11px] font-medium text-muted-foreground select-none">
      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer h-full px-1">
          <Database className="w-3 h-3" />
          <span>{activeWorkspace ? activeWorkspace.name : 'Personal'}</span>
        </div>
        
        <div className="w-px h-3.5 bg-border" />
        
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer h-full px-1">
          <Circle className="w-2 h-2 fill-success text-success" />
          <span>Google Connected</span>
        </div>

        <div className="w-px h-3.5 bg-border" />
        
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer h-full px-1">
          <Server className="w-3 h-3" />
          <span>2 MCP Servers</span>
        </div>
      </div>

      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer h-full px-1">
          <Zap className="w-3 h-3" />
          <span>GPT-5 (Mock)</span>
        </div>
        
        <div className="w-px h-3.5 bg-border" />
        
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer h-full px-1">
          <span>45ms</span>
        </div>

        <div className="w-px h-3.5 bg-border" />
        
        <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer h-full px-1">
          <Wifi className="w-3 h-3 text-success" />
          <span>Online</span>
        </div>
      </div>
    </footer>
  );
}
