'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExecution, useCancelExecution } from '@/services/api/execution';
import { Button } from '@/components/ui/button';
import { ArrowLeft, StopCircle, PlayCircle, Clock, Database, TerminalSquare, MessageSquare, ListTree } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/primitives/PageHeader';
import { StatusBadge } from '@/components/primitives/StatusBadge';
import { LoadingState } from '@/components/primitives/LoadingState';
import { cn } from '@/lib/utils';

type Tab = 'timeline' | 'tools' | 'logs' | 'events' | 'memory' | 'delegations' | 'llm';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>('timeline');

  const { data: execution, isLoading, error } = useExecution(id);
  const cancelMutation = useCancelExecution();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Failed': return 'danger';
      case 'Running': case 'Active': return 'info';
      case 'Waiting Approval': return 'warning';
      default: return 'neutral';
    }
  };

  if (isLoading) return <LoadingState message="Loading trace details..." />;
  if (error || !execution) return <div className="p-8 text-danger">Failed to load execution details.</div>;

  const isRunning = ['Running', 'Waiting Approval', 'Active'].includes(execution.status);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'timeline', label: 'Timeline', icon: ListTree },
    { id: 'tools', label: 'Tool Calls', icon: TerminalSquare },
    { id: 'llm', label: 'LLM Messages', icon: MessageSquare },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'logs', label: 'Logs', icon: TerminalSquare },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/executions')} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight truncate">Run {execution.id.split('-')[0]}</h1>
              <StatusBadge status={execution.status} variant={getStatusVariant(execution.status)} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Workflow: {execution.workflowId || 'Agent'}</p>
          </div>
          {isRunning && (
            <Button 
              variant="outline" 
              className="text-danger border-danger/20 hover:bg-danger/10"
              onClick={() => cancelMutation.mutate(id)}
              disabled={cancelMutation.isPending}
            >
              <StopCircle className="w-4 h-4 mr-2" /> Cancel
            </Button>
          )}
        </div>

        <div className="flex items-center gap-8 text-sm">
          <div>
            <span className="text-muted-foreground">Started: </span>
            <span className="font-medium">{execution.startedAt ? format(new Date(execution.startedAt), 'HH:mm:ss') : '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Duration: </span>
            <span className="font-medium">{execution.durationMs ? `${(execution.durationMs / 1000).toFixed(2)}s` : '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cost: </span>
            <span className="font-medium">-</span>
          </div>
          <div>
            <span className="text-muted-foreground">Tokens: </span>
            <span className="font-medium">-</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar (Tabs) */}
        <div className="w-64 border-r border-border bg-surface overflow-y-auto shrink-0 p-3 flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium w-full text-left",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-background p-6">
          {activeTab === 'timeline' && (
            <div className="max-w-3xl space-y-4">
              <h3 className="text-lg font-medium mb-4">Execution Trace</h3>
              <div className="border border-border rounded-lg p-4 bg-surface/50 font-mono text-sm">
                {!execution.logs?.length && !execution.toolCalls?.length && (
                   <div className="text-muted-foreground py-8 text-center">No trace events available yet.</div>
                )}
                {/* Normally we'd map over a sorted timeline of logs and tool calls here */}
                {execution.status === 'Completed' && (
                  <div className="flex items-center gap-4 text-muted-foreground mt-2 pt-4 border-t border-border">
                    <span className="text-success font-medium">Execution Completed</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="max-w-4xl space-y-6">
              <h3 className="text-lg font-medium">Tool Calls</h3>
              <div className="border border-border rounded-lg divide-y divide-border bg-card">
                {!execution.toolCalls?.length ? (
                  <div className="p-8 text-center text-muted-foreground">No tool calls made during this execution.</div>
                ) : (
                  execution.toolCalls.map((tc, idx) => (
                    <div key={idx} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-sm text-primary">{tc.name || 'unknown_tool'}</span>
                      </div>
                      <pre className="text-xs font-mono bg-background p-3 rounded text-muted-foreground overflow-auto">
                        {JSON.stringify(tc, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="h-full flex flex-col">
              <h3 className="text-lg font-medium mb-4 shrink-0">Raw Logs</h3>
              <div className="flex-1 border border-border rounded-lg bg-card p-4 overflow-y-auto font-mono text-xs text-muted-foreground">
                {execution.logs?.length ? (
                  execution.logs.map((log, i) => (
                    <div key={i} className="mb-1">{JSON.stringify(log)}</div>
                  ))
                ) : (
                  <div>Waiting for logs...</div>
                )}
              </div>
            </div>
          )}
          
          {(activeTab === 'llm' || activeTab === 'memory' || activeTab === 'events' || activeTab === 'delegations') && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Database className="w-8 h-8 mb-4 opacity-50" />
              <p>Section data not available in mock.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
