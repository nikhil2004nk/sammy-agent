'use client';

import { useUIStore } from '@/store/ui';
import { Activity, Wrench, FileText, Database } from 'lucide-react';

export function ActivityPanel() {
  const { activityPanelOpen } = useUIStore();

  if (!activityPanelOpen) return null;

  return (
    <aside className="w-80 border-l bg-background flex flex-col h-full hidden lg:flex">
      <div className="h-10 border-b flex items-center px-4">
        <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
      </div>
      
      {/* Tabs Placeholder */}
      <div className="flex border-b text-xs">
        <button className="flex-1 py-2 font-medium border-b-2 border-primary text-foreground">Timeline</button>
        <button className="flex-1 py-2 font-medium text-muted-foreground hover:text-foreground">Tools</button>
        <button className="flex-1 py-2 font-medium text-muted-foreground hover:text-foreground">Context</button>
        <button className="flex-1 py-2 font-medium text-muted-foreground hover:text-foreground">Logs</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Empty state for now */}
        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
          <Activity className="w-8 h-8 text-muted-foreground" />
          <div className="text-sm">No active execution</div>
        </div>
      </div>
    </aside>
  );
}
