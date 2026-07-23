'use client';

import React from 'react';
import { useUiStore } from '@/store/ui.store';
import { Activity, Network, Database, TerminalSquare, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useExecutionStream } from '@/hooks/useExecutionStream';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export function DeveloperDrawer({ executionId }: { executionId: string | null }) {
  const { developerModeLevel } = useUiStore();
  const workspaceId = useAuthStore(state => state.activeWorkspaceId);
  const { nodes, runStatus, isConnected } = useExecutionStream(executionId, workspaceId || '');

  return (
    <div className="w-1/3 h-full bg-surface/30 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-border bg-background/50 sticky top-0 z-10 backdrop-blur-sm">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <TerminalSquare className="w-4 h-4 text-primary" />
          Developer Inspector
          <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded uppercase">
            {developerModeLevel}
          </span>
        </h3>
        {executionId && (
          <div className="mt-2 text-xs flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-muted")}></div>
            <span className="text-muted-foreground font-mono truncate">Run: {executionId.split('-')[0]}... ({runStatus})</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Execution Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Live Timeline
          </h4>
          <div className="bg-background rounded-md border border-border p-3 space-y-3 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent min-h-[100px]">
            {nodes.length === 0 && !executionId && (
              <div className="text-xs text-muted-foreground text-center py-4 relative z-10 bg-background">
                Waiting for execution...
              </div>
            )}
            
            {nodes.map((node) => (
              <div key={node.id} className={cn("relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group", node.status === 'RUNNING' && "is-active")}>
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10",
                  node.status === 'RUNNING' ? "border-primary shadow shadow-primary/20" :
                  node.status === 'COMPLETED' ? "border-green-500" :
                  node.status === 'FAILED' ? "border-red-500" : "border-border"
                )}>
                  {node.status === 'RUNNING' && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                  {node.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                  {node.status === 'FAILED' && <XCircle className="w-3 h-3 text-red-500" />}
                  {node.status === 'PENDING' && <div className="w-2 h-2 rounded-full bg-muted"></div>}
                </div>
                <div className={cn(
                  "w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-2 rounded border text-xs shadow-sm",
                  node.status === 'RUNNING' ? "border-border bg-surface text-foreground" :
                  node.status === 'COMPLETED' ? "border-green-500/30 bg-green-500/5 text-foreground" :
                  "border-border bg-surface/50 text-muted-foreground"
                )}>
                  <div className="font-medium">{node.title}</div>
                  <div className="mt-1 opacity-80">{node.payload?.summary || node.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Only Features */}
        {developerModeLevel === 'advanced' && (
          <>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Network className="w-3 h-3" />
                Execution Graph (DAG)
              </h4>
              <div className="bg-background rounded-md border border-border p-4 h-32 flex flex-col gap-2 overflow-y-auto">
                {nodes.filter(n => n.type === 'PLAN').map(planNode => (
                  <div key={planNode.id} className="text-xs bg-surface p-2 rounded border border-border">
                    <div className="font-semibold text-primary mb-1">Plan Structure</div>
                    <pre className="text-[10px] text-muted-foreground overflow-x-auto">
                      {JSON.stringify(planNode.payload, null, 2)}
                    </pre>
                  </div>
                ))}
                {nodes.filter(n => n.type === 'PLAN').length === 0 && (
                  <span className="text-xs text-muted-foreground m-auto">Waiting for planner...</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Database className="w-3 h-3" />
                Memory Context
              </h4>
              <div className="bg-background rounded-md border border-border p-3 space-y-2 max-h-40 overflow-y-auto">
                {nodes.filter(n => n.type === 'MEMORY').map(memNode => (
                  <div key={memNode.id} className="text-xs p-2 bg-surface rounded border border-border text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {memNode.payload?.summary || 'Retrieved context'}
                  </div>
                ))}
                {nodes.filter(n => n.type === 'MEMORY').length === 0 && (
                  <span className="text-xs text-muted-foreground block text-center">No memory events yet</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
