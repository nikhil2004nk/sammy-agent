'use client';

import React from 'react';
import { Workflow, Plus, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkflowsPage() {
  return (
    <div className="flex-1 overflow-hidden flex flex-col w-full h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-background z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Workflow className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">Daily News Summarizer</h1>
            <p className="text-xs text-muted-foreground">Draft • Last edited 2 hours ago</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface border border-border text-foreground px-3 py-1.5 rounded-md font-medium text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <Play className="w-3 h-3" />
            Test Run
          </button>
          <button className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium text-xs hover:bg-primary/90 transition-colors">
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-surface/30 overflow-hidden flex items-center justify-center">
        {/* Placeholder for React Flow Canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--border)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border-2 border-dashed border-border flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Workflow Canvas</h2>
          <p className="text-sm text-muted-foreground">
            This space is reserved for the visual workflow builder. Soon you'll be able to drag, drop, and connect nodes to create complex automated processes.
          </p>
        </div>

        {/* Mock Nodes on Canvas */}
        <div className="absolute top-1/4 left-1/4 w-48 bg-background border border-border rounded-lg shadow-sm p-3 z-10 hidden md:block opacity-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-semibold">Trigger: Schedule</span>
          </div>
          <div className="text-[10px] text-muted-foreground">Every day at 9:00 AM</div>
        </div>

        <div className="absolute top-1/2 left-1/2 w-48 bg-background border border-border rounded-lg shadow-sm p-3 z-10 hidden md:block opacity-50 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-semibold">Agent: Researcher</span>
          </div>
          <div className="text-[10px] text-muted-foreground">Fetch AI News</div>
        </div>
      </div>
    </div>
  );
}
