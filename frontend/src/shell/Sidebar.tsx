'use client';

import { useUIStore } from '@/store/ui';
import { Bot, Settings, Workflow, Plug, Activity, CheckSquare, CalendarClock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const { sidebarOpen, sidebarMode, setSidebarMode } = useUIStore();
  const router = useRouter();

  if (!sidebarOpen) return null;

  const navItems = [
    { mode: 'agent', icon: Bot, label: 'Agents' },
    { mode: 'workflows', icon: Workflow, label: 'Workflows' },
    { mode: 'executions', icon: Activity, label: 'Executions' },
    { mode: 'approvals', icon: CheckSquare, label: 'Approvals' },
    { mode: 'scheduler', icon: CalendarClock, label: 'Scheduler' },
    { mode: 'connections', icon: Plug, label: 'Connections' },
    { mode: 'knowledge', icon: BookOpen, label: 'Knowledge' },
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
                  onClick={() => {
                    setSidebarMode(item.mode);
                    if (item.mode === 'settings') {
                      router.push('/settings');
                    } else if (item.mode === 'connections') {
                      router.push('/connections');
                    } else if (item.mode === 'agent') {
                      router.push('/agents');
                    } else if (item.mode === 'workflows') {
                      router.push('/workflows');
                    } else if (item.mode === 'executions') {
                      router.push('/executions');
                    } else if (item.mode === 'approvals') {
                      router.push('/approvals');
                    } else if (item.mode === 'scheduler') {
                      router.push('/scheduler');
                    } else if (item.mode === 'knowledge') {
                      router.push('/knowledge');
                    }
                  }}
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
