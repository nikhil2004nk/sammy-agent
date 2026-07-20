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
    <aside className="w-16 border-r bg-background flex flex-col h-full items-center py-4">
      <div className="mb-8 flex items-center justify-center w-full">
        <Bot className="w-8 h-8 text-primary" />
      </div>
      
      <nav className="flex-1 w-full overflow-y-auto">
        <ul className="space-y-4 px-2 w-full flex flex-col items-center">
          {navItems.map((item) => {
            const isActive = sidebarMode === item.mode;
            return (
              <li key={item.mode} className="w-full flex justify-center">
                <button
                  onClick={() => setSidebarMode(item.mode)}
                  title={item.label}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
