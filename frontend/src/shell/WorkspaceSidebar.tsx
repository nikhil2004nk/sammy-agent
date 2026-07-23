'use client';

import { 
  Bot, Settings, Workflow, Plug, Activity, 
  BookOpen, Database, MessageSquare, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useUiStore } from '@/store/ui.store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function WorkspaceSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDeveloperMode, toggleDeveloperMode, developerModeLevel, setDeveloperModeLevel } = useUiStore();

  const primaryItems = [
    { href: '/workspace/chats', icon: MessageSquare, label: 'Chats' },
    { href: '/workspace/agents', icon: Bot, label: 'Agents' },
    { href: '/workspace/connections', icon: Plug, label: 'Connections' },
    { href: '/workspace/knowledge', icon: BookOpen, label: 'Knowledge' },
    { href: '/workspace/memory', icon: Database, label: 'Memory' },
    { href: '/workspace/workflows', icon: Workflow, label: 'Workflows' },
    { href: '/workspace/monitoring', icon: Activity, label: 'Monitoring' },
    { href: '/workspace/team', icon: Users, label: 'Team' },
    { href: '/workspace/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-60 border-r border-border bg-background flex flex-col h-full overflow-hidden hidden md:flex">
      <div className="p-4 border-b border-border">
        <h2 className="font-bold text-lg text-primary tracking-tight">Sammy Workspace</h2>
      </div>

      <nav className="flex-1 w-full py-4 px-3 space-y-1 overflow-y-auto">
        {primaryItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <button
              key={item.href}
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
          );
        })}
      </nav>

      {/* Developer Mode Toggle */}
      <div className="p-4 border-t border-border bg-surface/30">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="dev-mode" className="text-sm font-medium">Developer Mode</Label>
          <Switch 
            id="dev-mode" 
            checked={isDeveloperMode} 
            onCheckedChange={toggleDeveloperMode} 
          />
        </div>
        
        {isDeveloperMode && (
          <div className="flex gap-2 mt-3 bg-background p-1 rounded-md border border-border">
            <button 
              className={cn(
                "flex-1 text-xs py-1 rounded transition-colors", 
                developerModeLevel === 'basic' ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:bg-surface"
              )}
              onClick={() => setDeveloperModeLevel('basic')}
            >
              Basic
            </button>
            <button 
              className={cn(
                "flex-1 text-xs py-1 rounded transition-colors", 
                developerModeLevel === 'advanced' ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:bg-surface"
              )}
              onClick={() => setDeveloperModeLevel('advanced')}
            >
              Advanced
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
