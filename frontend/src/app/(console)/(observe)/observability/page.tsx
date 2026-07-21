'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { Button } from '@/components/ui/button';
import { Activity, TerminalSquare, Database, ListTree } from 'lucide-react';
import { AppCard } from '@/components/primitives/AppCard';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/primitives/MetricCard';

type Tab = 'metrics' | 'logs' | 'events' | 'traces';

export default function ObservabilityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('metrics');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'metrics', label: 'Metrics', icon: Activity },
    { id: 'logs', label: 'Logs', icon: TerminalSquare },
    { id: 'events', label: 'Events', icon: Database },
    { id: 'traces', label: 'Traces', icon: ListTree },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 bg-background text-foreground">
      <div className="p-6 border-b border-border bg-background shrink-0">
        <PageHeader 
          title="Observability" 
          description="Monitor platform health, execution metrics, and system logs."
          className="mb-6"
        />
        
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Executions" value="1,245" trend={{ value: "12%", isPositive: true }} />
                <MetricCard title="Memory Hits" value="84%" trend={{ value: "2%", isPositive: true }} />
                <MetricCard title="Tool Calls" value="14,023" />
                <MetricCard title="Failure Rate" value="1.2%" trend={{ value: "0.4%", isPositive: false }} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AppCard className="p-6 h-64 flex flex-col">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Avg Execution Time</h3>
                  <div className="flex-1 flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
                    Chart Area Placeholder
                  </div>
                </AppCard>
                <AppCard className="p-6 h-64 flex flex-col">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Cost (Tokens)</h3>
                  <div className="flex-1 flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
                    Chart Area Placeholder
                  </div>
                </AppCard>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-card border border-border rounded-xl h-[600px] flex flex-col overflow-hidden">
              <div className="p-3 border-b border-border bg-surface flex items-center gap-4 text-sm text-muted-foreground">
                <span>Filter: All</span>
                <span>Level: Info, Error</span>
              </div>
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 text-muted-foreground">
                <div><span className="text-muted-foreground/50">[2026-07-21T09:30:00Z]</span> <span className="text-info">[INFO]</span> Starting workflow execution run_12345</div>
                <div><span className="text-muted-foreground/50">[2026-07-21T09:30:01Z]</span> <span className="text-info">[INFO]</span> Planner initialized successfully</div>
                <div><span className="text-muted-foreground/50">[2026-07-21T09:30:05Z]</span> <span className="text-warning">[WARN]</span> Tool execution took longer than expected (3.2s)</div>
                <div><span className="text-muted-foreground/50">[2026-07-21T09:30:12Z]</span> <span className="text-info">[INFO]</span> Workflow execution run_12345 completed</div>
                <div><span className="text-muted-foreground/50">[2026-07-21T09:35:22Z]</span> <span className="text-danger">[ERROR]</span> Failed to connect to Redis MCP on localhost:6379</div>
              </div>
            </div>
          )}

          {(activeTab === 'events' || activeTab === 'traces') && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Activity className="w-12 h-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No data yet</h3>
              <p className="text-sm">Events and distributed traces will appear here once configured.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
