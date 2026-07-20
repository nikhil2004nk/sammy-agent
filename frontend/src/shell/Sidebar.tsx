'use client';

import { useUIStore } from '@/store/ui';
import { Bot, MessageSquare, Settings, LayoutDashboard, BrainCircuit, Workflow, Plug } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { sidebarOpen, sidebarMode, setSidebarMode } = useUIStore();

  if (!sidebarOpen) return null;

  const navItems = [
    { mode: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { mode: 'conversation', icon: MessageSquare, label: 'Conversations' },
    { mode: 'agent', icon: Bot, label: 'Agents' },
    { mode: 'memory', icon: BrainCircuit, label: 'Memory' },
    { mode: 'workflow', icon: Workflow, label: 'Workflow' },
    { mode: 'connections', icon: Plug, label: 'Connections' },
    { mode: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <aside className="w-64 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Agent Console</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = sidebarMode === item.mode;
            return (
              <li key={item.mode}>
                <button
                  onClick={() => setSidebarMode(item.mode)}
                  className={cn(
                    "flex items-center w-full gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
