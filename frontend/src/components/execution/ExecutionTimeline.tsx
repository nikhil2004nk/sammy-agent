'use client';

import { Run, ExecutionNode } from '@/domains/execution/types';
import { EventCard } from './EventCard';
import { ReasoningCard } from './ReasoningCard';
import { ToolExecutionCard } from './ToolExecutionCard';
import { CheckCircle2, Clock, XCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutionTimelineProps {
  run: Run;
}

export function ExecutionTimeline({ run }: ExecutionTimelineProps) {
  const isSuccess = run.status === 'Completed';
  const isFailed = run.status === 'Failed';
  const isRunning = run.status === 'Running';

  const renderNode = (node: ExecutionNode) => {
    switch (node.type) {
      case 'event':
        return <EventCard key={node.id} node={node} />;
      case 'reasoning':
        return <ReasoningCard key={node.id} node={node} />;
      case 'tool':
        return <ToolExecutionCard key={node.id} node={node} />;
      default:
        // Fallback for planners, workflows, etc that aren't fully implemented yet
        return (
          <div key={node.id} className="py-2 px-6 text-xs text-muted-foreground italic border-l ml-3">
            [{node.type.toUpperCase()}] {node.name || 'Unknown Node'}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Summary */}
      <div className="p-4 border-b bg-muted/10 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-xs text-muted-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            {run.id}
          </div>
          
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
            {isFailed && <XCircle className="w-3.5 h-3.5 text-destructive" />}
            {isRunning && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
            <span className={cn(
              isSuccess ? "text-green-600 dark:text-green-400" :
              isFailed ? "text-destructive" :
              "text-blue-500"
            )}>
              {run.status}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {run.durationMs && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{(run.durationMs / 1000).toFixed(2)}s</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span>Tools used: {run.totalTools}</span>
          </div>
        </div>
      </div>

      {/* Timeline Tree */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* Background line connecting all elements */}
        {run.nodes.length > 0 && (
          <div className="absolute left-7 top-4 bottom-4 w-px bg-border -z-20" />
        )}
        
        <div className="space-y-1">
          {run.nodes.map(renderNode)}
        </div>
        
        {run.nodes.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8">
            No execution data available.
          </div>
        )}
      </div>
    </div>
  );
}
