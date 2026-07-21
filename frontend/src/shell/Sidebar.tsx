'use client';

import { 
  Bot, Settings, Workflow, Plug, Activity, 
  CheckSquare, CalendarClock, BookOpen, LayoutDashboard, Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const groups = [
    {
      title: "Observe",
      items: [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/observability', icon: Activity, label: 'Observability' },
      ]
    },
    {
      title: "Build",
      items: [
        { href: '/agents', icon: Bot, label: 'Agents' },
        { href: '/workflows', icon: Workflow, label: 'Workflows' },
        { href: '/knowledge', icon: BookOpen, label: 'Knowledge' },
      ]
    },
    {
      title: "Operate",
      items: [
        { href: '/conversations', icon: Bot, label: 'Conversations' },
        { href: '/executions', icon: Activity, label: 'Executions' },
        { href: '/context', icon: Database, label: 'Context' },
        { href: '/approvals', icon: CheckSquare, label: 'Approvals' },
        { href: '/scheduler', icon: CalendarClock, label: 'Scheduler' },
      ]
    },
    {
      title: "Connect",
      items: [
        { href: '/integrations', icon: Plug, label: 'Integrations' },
      ]
    },
    {
      title: "Manage",
      items: [
        { href: '/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  return (
    <aside className="w-56 border-r border-border bg-background flex flex-col h-full overflow-y-auto hidden md:flex">
      <nav className="flex-1 w-full py-6 px-3 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </h4>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
