'use client';

import { ExecutionNode } from '@/domains/execution/types';
import { Wrench, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { JsonViewer } from '../JsonViewer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ToolExecutionCardProps {
  node: ExecutionNode;
}

export function ToolExecutionCard({ node }: ToolExecutionCardProps) {
  const isSuccess = node.status === 'Completed';
  const isFailed = node.status === 'Failed';
  const isRunning = node.status === 'Running';

  const copyToolName = () => {
    if (node.name) {
      navigator.clipboard.writeText(node.name);
      toast.success('Copied tool name');
    }
  };

  return (
    <div className="flex gap-3 py-2 px-2 relative group">
      <div className="relative flex justify-center w-6 shrink-0 mt-1">
        <div className="absolute w-px h-[calc(100%+16px)] bg-border -z-10 -top-2" />
        <div className={cn(
          "w-6 h-6 rounded-md flex items-center justify-center border shadow-sm z-10",
          isFailed ? "bg-destructive/10 border-destructive/30 text-destructive" : 
          isRunning ? "bg-blue-500/10 border-blue-500/30 text-blue-500" :
          "bg-primary/10 border-primary/30 text-primary"
        )}>
          <Wrench className="w-3.5 h-3.5" />
        </div>
      </div>
      
      <div className={cn(
        "flex-1 min-w-0 border rounded-lg p-3 shadow-sm transition-colors",
        isFailed ? "bg-destructive/5 border-destructive/20" : "bg-card hover:bg-muted/30"
      )}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span 
              onClick={copyToolName}
              className="text-sm font-semibold text-foreground cursor-pointer hover:underline decoration-muted-foreground/30 underline-offset-2"
              title="Copy Tool Name"
            >
              {node.name || 'Unknown Tool'}
            </span>
            {node.agentName && (
              <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                {node.agentName}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            {node.durationMs && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {node.durationMs}ms
              </span>
            )}
            
            {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
            {isFailed && <XCircle className="w-3.5 h-3.5 text-destructive" />}
            {isRunning && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
            
            <span className={cn(
              "font-medium tracking-wide text-[10px] uppercase",
              isSuccess ? "text-green-600 dark:text-green-400" :
              isFailed ? "text-destructive" :
              "text-blue-500"
            )}>
              {node.status}
            </span>
          </div>
        </div>

        <div className="space-y-2 mt-3">
          {node.arguments !== undefined && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Arguments</div>
              <JsonViewer data={node.arguments} defaultExpanded={false} />
            </div>
          )}
          
          {node.result !== undefined && (
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-2">Result</div>
              <JsonViewer data={node.result} defaultExpanded={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
