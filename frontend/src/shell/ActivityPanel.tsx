'use client';

import { useUIStore } from '@/store/ui';
import { Activity, FileText, Database } from 'lucide-react';
import { ExecutionTimeline } from '@/components/execution/ExecutionTimeline';
import { mockRun } from '@/domains/execution/mock';
import { useState } from 'react';

type Tab = 'timeline' | 'tools' | 'context' | 'logs';

export function ActivityPanel() {
  const { activityPanelOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('timeline');

  // In reality, this would be fetched via React Query based on the active run ID.
  // const { data: run } = useActiveRun();
  const activeRun = mockRun;

  if (!activityPanelOpen) return null;

  return (
    <aside className="w-80 lg:w-96 border-l bg-background flex flex-col h-full hidden lg:flex">
      <div className="h-10 border-b flex items-center px-4 shrink-0">
        <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
      </div>
      
      <div className="flex border-b text-xs shrink-0 bg-muted/10">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2.5 font-medium border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
        >
          Timeline
        </button>
        <button 
          onClick={() => setActiveTab('context')}
          className={`flex-1 py-2.5 font-medium border-b-2 transition-colors ${activeTab === 'context' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
        >
          Context
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2.5 font-medium border-b-2 transition-colors ${activeTab === 'logs' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
        >
          Logs
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'timeline' && (
          activeRun ? <ExecutionTimeline run={activeRun} /> : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50 p-4">
              <Activity className="w-8 h-8 text-muted-foreground" />
              <div className="text-sm">No execution selected</div>
            </div>
          )
        )}

        {activeTab === 'context' && (
          <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
            <Database className="w-8 h-8 opacity-20" />
            <div>Context Viewer<br/><span className="text-xs opacity-70">Coming soon</span></div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
            <FileText className="w-8 h-8 opacity-20" />
            <div>System Logs<br/><span className="text-xs opacity-70">Coming soon</span></div>
          </div>
        )}
      </div>
    </aside>
  );
}
